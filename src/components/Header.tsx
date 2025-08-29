import React, { useState } from 'react';
import { Network, Share2, Copy, Check, Link } from 'lucide-react';
import { getShortenedShareableUrl } from '../utils/urlShortener';
import { IPv4Subnet } from '../types';

// Extend window interface for test function
declare global {
  interface Window {
    testSerialization: () => { initialNetwork: IPv4Subnet | null; subnets: IPv4Subnet[]; selectedSubnetId: string | null; } | null;
  }
}

interface HeaderProps {
  getShareableUrl?: () => string;
  initialNetwork?: IPv4Subnet | null;
  subnets?: IPv4Subnet[];
  selectedSubnetId?: string | null;
}

const Header: React.FC<HeaderProps> = ({ getShareableUrl, initialNetwork, subnets, selectedSubnetId }) => {
  const [showCopied, setShowCopied] = useState(false);
  const [isShortening, setIsShortening] = useState(false);

  const handleShare = async () => {
    if (!getShareableUrl) return;

    const shareUrl = getShareableUrl();

    try {
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'IPv4 Subnet Designer',
          text: 'Check out this network design!',
          url: shareUrl,
        });
      } else {
        // Fallback: show message that Web Share API is not available
        alert('Web Share API not available. Use the Copy Link button instead.');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!getShareableUrl) return;

    const shareUrl = getShareableUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: try to use the older clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Failed to copy with fallback method:', fallbackError);
        alert('Failed to copy link. Please copy the URL manually.');
      }
    }
  };

  const handleShortenLink = async () => {
    if (!initialNetwork || !subnets) return;

    setIsShortening(true);
    try {
      const shortUrl = await getShortenedShareableUrl(
        initialNetwork,
        subnets,
        selectedSubnetId || null
      );

      await navigator.clipboard.writeText(shortUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      alert(`Short link copied to clipboard!
${shortUrl}`);
    } catch (error) {
      console.error('Failed to shorten URL:', error);
      // Fallback to copying the regular URL
      if (getShareableUrl) {
        await handleCopyLink();
      }
      alert('URL shortening failed. Copied regular link instead.');
    } finally {
      setIsShortening(false);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-surface border-b border-border shadow-lg rounded-t-xl">
      <div className="flex items-center">
        <Network className="w-8 h-8 text-primary mr-3" />
        <h1 className="text-2xl font-serif font-bold text-text tracking-wide">
          IPv4 Subnet Designer
        </h1>
      </div>

      {getShareableUrl && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-md"
            title="Share via device sharing options"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors duration-200 shadow-md"
            title="Copy shareable link to clipboard"
          >
            {showCopied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleShortenLink}
            disabled={isShortening}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate and copy shortened link"
          >
            {isShortening ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Shortening...</span>
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                <span className="hidden sm:inline">Short Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
