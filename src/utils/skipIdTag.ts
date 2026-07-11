export function skipIdTag(buffer: Buffer, offSet: number): number {
  // Check if the buffer starts with an ID3v2 header.
  if (
    buffer.length >= 10 &&
    buffer[0] === 0x49 && // I // 73
    buffer[1] === 0x44 && // D // 68
    buffer[2] === 0x33 // 3 // 51
  ) {
    /*
     * Bytes 6-9 of the ID3 header store the tag size as a
     * 28-bit "synchsafe" integer. Each byte contributes only
     * 7 bits, so the four bytes together represent one 28-bit
     * value rather than four independent numbers.
     *
     * We shift each 7-bit chunk into its correct position and
     * combine them to reconstruct the full tag size.
     *
     * tagSize is the number of bytes occupied by the ID3 metadata
     * (not including the 10-byte header). To reach the first MP3
     * audio frame, skip the header plus the metadata.
     *
     * buffer[6]=5 or 0000101
     *
     * & 0x7F simply ensures the value is between 0 and 127 by clearing the top bit.
     *
     * << 21 -> 0000101 0000000 0000000 0000000
     *
     * buffer[3] is the ID3 version major (2.4) usally 04
     *
     * buffer[4] is the revision of the ID3 specification.
     *
     * buffer[5] is feature flags
     */
    const tagSize =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f);

    offSet = 10 + tagSize;
  }
  return offSet;
}
