import { TwitterApi } from 'twitter-api-v2';

export type Platform = 'twitter' | 'instagram' | 'linkedin';

export type ConnectedAccount = {
    platform: Platform;
    platform_user_id: string;
    access_token: string;
    refresh_token?: string;
};

export type PublishResult = {
    platform: Platform;
    success: boolean;
    error?: string;
};

function errorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null && 'message' in err) {
        const m = (err as { message: unknown }).message;
        if (typeof m === 'string') return m;
    }
    return 'Unexpected error';
}

type LinkedInShareContent =
    | {
          shareCommentary: { text: string };
          shareMediaCategory: 'NONE';
      }
    | {
          shareCommentary: { text: string };
          shareMediaCategory: 'IMAGE';
          media: Array<{
              status: 'READY';
              description: { text: string };
              media: string;
              title: { text: string };
          }>;
      };

// ─── Twitter ────────────────────────────────────────────────────────────────

async function publishToTwitter(
    account: ConnectedAccount,
    content: string,
    imageUrl?: string
): Promise<PublishResult> {
    try {
        const client = new TwitterApi(account.access_token);

        let mediaId: string | undefined;

        if (imageUrl) {
            try {
                const imageRes = await fetch(imageUrl);
                const buffer = Buffer.from(await imageRes.arrayBuffer());
                const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
                mediaId = await client.v1.uploadMedia(buffer, { mimeType: contentType });
            } catch {
                console.warn('Twitter image upload failed, posting without image');
            }
        }

        await client.v2.tweet({
            text: content,
            ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
        });

        return { platform: 'twitter', success: true };
    } catch (err: unknown) {
        return {
            platform: 'twitter',
            success: false,
            error: errorMessage(err) || 'Twitter publish failed',
        };
    }
}

// ─── Instagram ──────────────────────────────────────────────────────────────

async function publishToInstagram(
    account: ConnectedAccount,
    content: string,
    imageUrl?: string
): Promise<PublishResult> {
    try {
        const igUserId = account.platform_user_id;
        const token = account.access_token;
        const baseUrl = 'https://graph.instagram.com/v19.0';

        if (!imageUrl) {
            return {
                platform: 'instagram',
                success: false,
                error: 'Instagram requires an image or video to post',
            };
        }

        const containerBody = new URLSearchParams({
            image_url: imageUrl,
            caption: content,
            access_token: token,
        });

        const containerRes = await fetch(`${baseUrl}/${igUserId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: containerBody,
        });

        const container = (await containerRes.json()) as { id?: string; error?: { message?: string } };
        if (!container.id) {
            throw new Error(container.error?.message || 'Failed to create media container');
        }

        const publishBody = new URLSearchParams({
            creation_id: container.id,
            access_token: token,
        });

        const publishRes = await fetch(`${baseUrl}/${igUserId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: publishBody,
        });

        const published = (await publishRes.json()) as { id?: string; error?: { message?: string } };
        if (!published.id) {
            throw new Error(published.error?.message || 'Failed to publish media');
        }

        return { platform: 'instagram', success: true };
    } catch (err: unknown) {
        return {
            platform: 'instagram',
            success: false,
            error: errorMessage(err) || 'Instagram publish failed',
        };
    }
}

// ─── LinkedIn ───────────────────────────────────────────────────────────────

async function publishToLinkedIn(
    account: ConnectedAccount,
    content: string,
    imageUrl?: string
): Promise<PublishResult> {
    try {
        const token = account.access_token;
        const authorUrn = `urn:li:person:${account.platform_user_id}`;

        let shareContent: LinkedInShareContent = {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE',
        };

        if (imageUrl) {
            const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    registerUploadRequest: {
                        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                        owner: authorUrn,
                        serviceRelationships: [
                            {
                                relationshipType: 'OWNER',
                                identifier: 'urn:li:userGeneratedContent',
                            },
                        ],
                    },
                }),
            });

            const registerData = (await registerRes.json()) as {
                value?: {
                    asset?: string;
                    uploadMechanism?: {
                        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'?: { uploadUrl?: string };
                    };
                };
                message?: string;
            };

            if (!registerRes.ok) {
                throw new Error(registerData.message || 'LinkedIn register upload failed');
            }

            const uploadUrl =
                registerData.value?.uploadMechanism?.[
                    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
                ]?.uploadUrl;
            const assetId = registerData.value?.asset;

            if (uploadUrl && assetId) {
                const imageRes = await fetch(imageUrl);
                const buffer = await imageRes.arrayBuffer();

                const putRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/octet-stream',
                    },
                    body: buffer,
                });

                if (putRes.ok) {
                    shareContent = {
                        shareCommentary: { text: content },
                        shareMediaCategory: 'IMAGE',
                        media: [
                            {
                                status: 'READY',
                                description: { text: '' },
                                media: assetId,
                                title: { text: '' },
                            },
                        ],
                    };
                }
            }
        }

        const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify({
                author: authorUrn,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': shareContent,
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                },
            }),
        });

        if (!postRes.ok) {
            const errBody = (await postRes.json()) as {
                message?: string;
                errors?: Array<{ message?: string }>;
            };
            const msg =
                errBody.message ||
                errBody.errors?.[0]?.message ||
                `LinkedIn post failed (${postRes.status})`;
            throw new Error(msg);
        }

        return { platform: 'linkedin', success: true };
    } catch (err: unknown) {
        return {
            platform: 'linkedin',
            success: false,
            error: errorMessage(err) || 'LinkedIn publish failed',
        };
    }
}

// ─── Main publisher ─────────────────────────────────────────────────────────

export async function publishPost(
    accounts: ConnectedAccount[],
    platforms: Platform[],
    content: string,
    imageUrl?: string
): Promise<PublishResult[]> {
    const settled = await Promise.allSettled(
        platforms.map(async (platform) => {
            const account = accounts.find((a) => a.platform === platform);
            if (!account) {
                return {
                    platform,
                    success: false,
                    error: 'Account not connected',
                } satisfies PublishResult;
            }

            switch (platform) {
                case 'twitter':
                    return publishToTwitter(account, content, imageUrl);
                case 'instagram':
                    return publishToInstagram(account, content, imageUrl);
                case 'linkedin':
                    return publishToLinkedIn(account, content, imageUrl);
            }
        })
    );

    return settled.map((r, i) => {
        const platform = platforms[i]!;
        if (r.status === 'fulfilled') {
            return r.value;
        }
        return {
            platform,
            success: false,
            error: errorMessage(r.reason),
        };
    });
}
