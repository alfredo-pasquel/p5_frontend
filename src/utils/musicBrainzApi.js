// utils/musicBrainzApi.js
export const fetchDetailedAlbumData = async (albumName) => {
    const response = await fetch(
      `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(albumName)}&fmt=json&limit=1&inc=artist-credits+recordings+release-groups+genres+aliases+annotation+tags+user-tags+url-rels+labels+series+area-rels+artist-rels+place-rels+event-rels`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch MusicBrainz album details');
    }
    const data = await response.json();
    return data.releases[0]; // Return the first matching release with all included resources
  };
  