import { IPv4Subnet } from '../types';
import { getShareableUrl } from './urlState';

/**
 * Shortens a URL using a free URL shortening service
 */
export const shortenUrl = async (longUrl: string): Promise<string> => {
  try {
    // Using CleanURI - a free URL shortener that doesn't require API keys
    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        url: longUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.result_url) {
      return data.result_url;
    } else {
      throw new Error('Invalid response from URL shortener');
    }
  } catch (error) {
    console.error('Failed to shorten URL:', error);

    // Fallback: Try TinyURL as backup
    try {
      const tinyUrlResponse = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      if (tinyUrlResponse.ok) {
        const shortUrl = await tinyUrlResponse.text();
        return shortUrl;
      }
    } catch (tinyError) {
      console.error('TinyURL fallback also failed:', tinyError);
    }

    // If both services fail, return the original URL
    throw new Error('Unable to shorten URL. Using original link.');
  }
};

/**
 * Gets a shortened shareable URL
 */
export const getShortenedShareableUrl = async (initialNetwork: IPv4Subnet | null, subnets: IPv4Subnet[], selectedSubnetId: string | null): Promise<string> => {
  const longUrl = getShareableUrl(initialNetwork, subnets, selectedSubnetId);

  try {
    const shortUrl = await shortenUrl(longUrl);
    return shortUrl;
  } catch (error) {
    console.warn('URL shortening failed, using original URL:', error);
    return longUrl; // Fallback to original URL
  }
};
