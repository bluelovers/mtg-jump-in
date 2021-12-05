declare let record: Record<string, Record<string, {
    name: string;
    amount?: `${number}`;
    set?: string;
    appears?: `${number}%`;
}[]>>;
export = record;
