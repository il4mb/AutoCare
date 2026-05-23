export function parseODBResponse(hexString: string): string[] {
    // 1. Bersihkan string dari spasi (misal: "43 01 33 00 00 00 00" -> "43013300000000")
    const cleanHex = hexString.replace(/\s+/g, '').toUpperCase();

    // 2. Validasi: Balasan DTC (Mode 03) harus diawali dengan "43"
    if (!cleanHex.startsWith('43') || cleanHex.length < 6) {
        return [];
    }

    const dtcList: string[] = [];

    // 3. Potong 2 karakter pertama ("43") karena itu hanya kode sukses
    const dataHex = cleanHex.substring(2);

    // 4. Proses per 4 karakter (2 byte = 1 kode DTC)
    for (let i = 0; i < dataHex.length; i += 4) {
        const dtcHex = dataHex.substring(i, i + 4);

        // Abaikan jika isinya "0000" (padding kosong)
        if (dtcHex === "0000" || dtcHex.length < 4) continue;

        // Ambil byte pertama (2 karakter awal) dan byte kedua
        const byteA = parseInt(dtcHex.substring(0, 2), 16);
        const byteBHex = dtcHex.substring(2, 4);

        // --- ATURAN KONVERSI OBD-II ---
        // Huruf pertama ditentukan dari 2 bit awal (Byte A >> 6)
        const dtcLetterMap = ['P', 'C', 'B', 'U'];
        const firstLetter = dtcLetterMap[(byteA >> 6) & 0x03];

        // Angka pertama ditentukan dari 2 bit berikutnya
        const firstDigit = ((byteA >> 4) & 0x03).toString();

        // Sisa byte A
        const secondDigit = (byteA & 0x0F).toString(16).toUpperCase();

        // Gabungkan: Huruf + Angka1 + Angka2 + Byte B
        const dtcCode = `${firstLetter}${firstDigit}${secondDigit}${byteBHex}`;
        dtcList.push(dtcCode);
    }

    return dtcList;
}