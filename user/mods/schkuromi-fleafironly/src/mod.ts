import { DependencyContainer } from "tsyringe";

import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";

class Mod implements IPostDBLoadMod
{    
    public postDBLoad(container: DependencyContainer): void
    {
        const logger = container.resolve<ILogger>("WinstonLogger");

        // get database from the server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // get all the in-memory json foudn in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        // change flea market to only allow selling for FIR items
        tables.globals.config.RagFair.isOnlyFoundInRaidAllowed = true;
        
        logger.log("[SCHKRM] Flea Market now only accepts FIR items", "yellow");
    }
}

export const mod = new Mod();

