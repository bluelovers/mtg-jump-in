interface IPacketsCard {
    name: string;
    amount?: `${number}`;
    set?: string;
    appears?: `${number}%`;
}
declare type IPackets = Record<string, IPacketsCard[]>;
declare type IJumpInRecord = Record<string | "Jump In!", IPackets>;
declare let record: IJumpInRecord;
export = record;
