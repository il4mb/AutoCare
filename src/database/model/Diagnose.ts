import { Model } from "@nozbe/watermelondb";
import { date, field, json, text } from "@nozbe/watermelondb/decorators";

export class Diagnose extends Model {
    static table = "diagnoses";

    @field("uid")
    uid!: string

    @json("model", (value) => typeof value === "string" ? JSON.parse(value) : value)
    model!: {
        id: string;
        name: string;
    } | null

    @text("codes")
    codes!: string

    @json("description", (value) => typeof value === "string" ? JSON.parse(value) : value)
    description!: {
        [code: string]: string
    }

    @json("symptoms", (value) => typeof value === "string" ? JSON.parse(value) : value)
    symptoms!: {
        [code: string]: string
    }

    @json("causes", (value) => typeof value === "string" ? JSON.parse(value) : value)
    causes!: {
        [code: string]: string
    }

    @json("solutions", (value) => typeof value === "string" ? JSON.parse(value) : value)
    solutions!: {
        [code: string]: string
    }

    @date("created_at")
    createdAt!: Date
}