export function parseODBResponse(hexString: string): string[] {
    const cleanHex = hexString.replace(/\s+/g, '').toUpperCase();

    if (!cleanHex.startsWith('43') || cleanHex.length < 6) {
        return [];
    }

    const dtcList: string[] = [];

    // Skip "43" (2 char) + byte jumlah DTC (2 char) = mulai dari index 4
    const dataHex = cleanHex.substring(4); // ← fix: 4 bukan 2

    for (let i = 0; i < dataHex.length; i += 4) {
        const dtcHex = dataHex.substring(i, i + 4);

        if (dtcHex === '0000' || dtcHex.length < 4) continue;

        const byteA = parseInt(dtcHex.substring(0, 2), 16);
        const byteBHex = dtcHex.substring(2, 4);

        const dtcLetterMap = ['P', 'C', 'B', 'U'];
        const firstLetter = dtcLetterMap[(byteA >> 6) & 0x03];
        const firstDigit = ((byteA >> 4) & 0x03).toString();
        const secondDigit = (byteA & 0x0F).toString(16).toUpperCase();

        const dtcCode = `${firstLetter}${firstDigit}${secondDigit}${byteBHex}`;
        dtcList.push(dtcCode);
    }

    return dtcList;
}