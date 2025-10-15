# ZUNNO

AI-Powered Prompt Generation for Creators. Generate optimized prompts for AI image and video generation across multiple platforms.

## Features

- 🎨 **Multi-Platform Support**: Generate prompts for Leonardo, Midjourney, Stable Diffusion, DALL-E 3, Flux, Sora, Runway, and Pika Labs
- 🖼️ **Image & Video**: Support for both image and video generation prompts
- ⭐ **Favorites**: Save your favorite prompts with localStorage persistence
- 📋 **One-Click Copy**: Copy prompts and negative prompts with a single click
- 🎯 **Optimized Prompts**: AI-generated prompts with technical terms, emphasis, and quality indicators
- 🎨 **Modern UI**: Beautiful, responsive interface with animated backgrounds

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `env.example` to `.env.local`
   - Add your Anthropic API key:

     ```
     ANTHROPIC_API_KEY=your_anthropic_api_key_here
     ```

   - Get your API key from [Anthropic Console](https://console.anthropic.com/)

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Select Content Type**: Choose between Image or Video generation
2. **Pick Platform**: Select your target AI platform (Leonardo, Midjourney, etc.)
3. **Enter Your Idea**: Describe what you want to create
4. **Generate**: Click "FORGE PROMPTS" to generate 4 optimized variations
5. **Save Favorites**: Star prompts you like to save them for later
6. **Copy & Use**: Copy prompts directly to your AI platform

## Supported Platforms

### Image Generation

- **Leonardo**: AI art generation
- **Midjourney**: Discord-based AI art
- **Stable Diffusion**: Open-source image generation
- **DALL-E 3**: OpenAI's image generation
- **Flux**: High-quality image generation

### Video Generation

- **Sora**: OpenAI's video generation
- **Runway**: AI video editing and generation
- **Pika Labs**: AI video creation

## Technical Details

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Secure Anthropic API integration
- **Storage**: localStorage for favorites persistence

## Security

- API keys are stored server-side only
- No client-side exposure of sensitive credentials
- Secure API proxy prevents CORS issues

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## License

MIT License - feel free to use this project for your own applications.
