import api from '@/api';
import { db, Diagnose } from '@/database';

type DiagnosePayload = {
    uid: string;
    codes: string[];
    description: { [code: string]: string };
    symptoms: { [code: string]: string };
    causes: { [code: string]: string };
    solutions: { [code: string]: string };
    model: {
        id: string;
        name: string;
    } | null;
};
export const insertDiagnose = async (data: DiagnosePayload) => {

    try {
        const collection = db.get<Diagnose>(Diagnose.table);
        return await db.write(async () => {
            return await collection.create((diagnose) => {
                diagnose.uid = data.uid;
                diagnose.codes = data.codes.sort((a, b) => a.localeCompare(b)).join(","); // Simpan sebagai string yang dipisahkan koma
                diagnose.description = data.description;
                diagnose.symptoms = data.symptoms;
                diagnose.causes = data.causes;
                diagnose.solutions = data.solutions;
                diagnose.model = data.model;
                diagnose.createdAt = new Date();
            });
        });

    } catch (error) {
        console.error("Error inserting diagnose:", error);
    }
}


type DiagnoseResponse = {
    success: boolean;
    message?: string;
    data: {
        id: string;
        code: string;
        description: string;
        symptoms: string[];
        causes: string[];
        solutions: string[];
    }[]
    model: {
        id: string;
        name: string;
    } | null;
}
export const createDiagnoseByCodeAndModel = async (codes: string[], modelId: string | null, uid: string) => {

    const response = await api.get<DiagnoseResponse>("/diagnose", {
        params: {
            codes: codes.join(","),
            model: modelId || undefined,
        },
    });
    if (!response.data.success) {
        throw new Error(response.data.message || "Gagal mengambil data diagnosa");
    }
    const diagnoseData = response.data.data;
    const modelData = response.data.model;

    const diagnosePayload: DiagnosePayload = {
        uid: uid,
        codes: codes,
        description: diagnoseData.reduce((acc, item) => {
            acc[item.code] = item.description;
            return acc;
        }, {} as { [code: string]: string }),
        symptoms: diagnoseData.reduce((acc, item) => {
            acc[item.code] = item.symptoms.join(", ");
            return acc;
        }, {} as { [code: string]: string }),
        causes: diagnoseData.reduce((acc, item) => {
            acc[item.code] = item.causes.join(", ");
            return acc;
        }, {} as { [code: string]: string }),
        solutions: diagnoseData.reduce((acc, item) => {
            acc[item.code] = item.solutions.join(", ");
            return acc;
        }, {} as { [code: string]: string }),
        model: modelData,
    };
    return insertDiagnose(diagnosePayload);
}