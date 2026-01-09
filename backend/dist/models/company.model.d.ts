export interface Company {
    id: string;
    name: string;
    description?: string;
    website?: string;
    created_at: Date;
    updated_at: Date;
}
export declare class CompanyModel {
    static getAll(): Promise<Company[]>;
}
//# sourceMappingURL=company.model.d.ts.map