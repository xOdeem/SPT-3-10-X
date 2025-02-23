/* eslint-disable @typescript-eslint/naming-convention */
import { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";

export interface IBossPattern extends IBossLocationSpawn
{
    OnlySpawnOnce?: boolean;
}

export const roleCase: object = {
    assault: "assault",
    exusec: "exUsec",
    marksman: "marksman",
    pmcbot: "pmcBot",
    sectantpriest: "sectantPriest",
    sectantwarrior: "sectantWarrior",
    assaultgroup: "assaultGroup",
    bossbully: "bossBully",
    bosstagilla: "bossTagilla",
    bossgluhar: "bossGluhar",
    bosskilla: "bossKilla",
    bosskojaniy: "bossKojaniy",
    bosssanitar: "bossSanitar",
    bossboar: "bossBoar",
    bossboarsniper: "bossBoarSniper",
    bosskolontay: "bossKolontay",
    bosspunisher: "bosspunisher",
    bosslegion: "bosslegion",
    bosspartisan: "bossPartisan",
    followerboar: "followerBoar",
    followerboarclose1: "followerBoarClose1",
    followerboarclose2: "followerBoarClose2",
    followerbully: "followerBully",
    followergluharassault: "followerGluharAssault",
    followergluharscout: "followerGluharScout",
    followergluharsecurity: "followerGluharSecurity",
    followergluharsnipe: "followerGluharSnipe",
    followerkojaniy: "followerKojaniy",
    followersanitar: "followerSanitar",
    followertagilla: "followerTagilla",
    followerkolontayassault: "followerKolontayAssault",
    followerkolontaysecurity: "followerKolontaySecurity",
    cursedassault: "cursedAssault",
    pmc: "pmc",
    usec: "usec",
    bear: "bear",
    sptbear: "sptBear",
    sptusec: "sptUsec",
    bosstest: "bossTest",
    followertest: "followerTest",
    gifter: "gifter",
    bossknight: "bossKnight",
    followerbigpipe: "followerBigPipe",
    followerbirdeye: "followerBirdEye",
    bosszryachiy: "bossZryachiy",
    followerzryachiy: "followerZryachiy",
    arenafighterevent: "arenaFighterEvent",
    crazyassaultevent: "crazyAssaultEvent"
};

export const reverseBossNames: object = {
    bossboar: "kaban",
    bossbully: "reshala",
    bosstagilla: "tagilla",
    bossgluhar: "gluhar",
    bosskilla: "killa",
    bosskojaniy: "shturman",
    bosssanitar: "sanitar",
    bossknight: "goons",
    bosszryachiy: "zryachiy",
    bosskolontay: "kolontay",
    bosspartisan: "partisan",
    marksman: "scav_snipers",
    sectantpriest: "cultists",
    exusec: "rogues",
    pmcbot: "raiders",
    crazyassaultevent: "crazyscavs",
    arenafighterevent: "bloodhounds",
    bosspunisher: "punisher",
    bosslegion: "legion",
    gifter: "santa"
};

export const reverseMapNames: object = {
    factory4_day: "factory",
    factory4_night: "factory_night",
    bigmap: "customs",
    woods: "woods",
    shoreline: "shoreline",
    lighthouse: "lighthouse",
    rezervbase: "reserve",
    interchange: "interchange",
    laboratory: "laboratory",
    tarkovstreets: "streets",
    sandbox: "groundzero",
    sandbox_high: "groundzero_high"
};

export const diffProper = {
    easy: "easy",
    asonline: "random",
    normal: "normal",
    hard: "hard",
    impossible: "impossible"
};

export const validMaps: string[] = [
    "bigmap",
    "factory4_day",
    "factory4_night",
    "interchange",
    "laboratory",
    "lighthouse",
    "rezervbase",
    "shoreline",
    "tarkovstreets",
    "woods",
    "sandbox",
    "sandbox_high"
];
