import React from "react";
import Link from "next/link";
import lol_champions from "@/lol_champions.json";
import lol_spells from "@/lol_summoner_spells.json";
import Image from "next/image";
import { Tooltip } from "react-tooltip";

const GameInfoBar = ({ data }) => {
  const dateFromTimestamp = new Date(data.game_end_timestamp);
  const currentDate = new Date();
  const timeDifference = currentDate - dateFromTimestamp;
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const gameVersion = data.gameVersion.split(".").slice(0, 2).join(".");

  const champIcon =
    "https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/" +
    lol_champions.data[data.championName].image.full;
  const champName = lol_champions.data[data.championName].name;

  const role =
    "https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/roles/" +
    data.teamPosition.toLowerCase() +
    ".png";
  const sum_spell_1_str = data.summoner1Id.toString();
  const sum_spell_2_str = data.summoner2Id.toString();
  function findSummonerByKey(data, key) {
    for (const summoner in data) {
      if (data[summoner].key === key) {
        return data[summoner].image.full;
      }
    }
    return null;
  }
  const sum1img = findSummonerByKey(lol_spells.data, sum_spell_1_str);
  const sum2img = findSummonerByKey(lol_spells.data, sum_spell_2_str);
  const summoner1 =
    "https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/sum_spells/" +
    sum1img;
  const summoner2 =
    "https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/sum_spells/" +
    sum2img;
  const items = [
    data.item0,
    data.item1,
    data.item2,
    data.item3,
    data.item4,
    data.item5,
    data.item6,
  ];
  const kda = (data.kills + data.assists) / data.deaths;
  const cs_per_m = data.totalMinionsKilled / data.game_time;
  const kill_part = data.killParticipation * 100;

  return (
    <div
      className={`bg-zinc-800 p-2 px-4 rounded-md border-l-2 ${
        data.win === false ? "border-red-500" : "border-cyan-500"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="uppercase text-xs">Ranked Solo</span>
          <span className=" text-xs text-zinc-400">
            {daysDifference === 0 ? "Today" : `${daysDifference}d ago`}
          </span>
          <span className=" text-xs text-teal-400">
            {data.game_time} minutes
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <span className=" text-xs text-zinc-400">Patch {gameVersion}</span>
          <Link
            href={"#"}
            className="text-xs p-1 font-bold border border-teal-500 bg-teal-500 text-zinc-950 rounded-sm uppercase hover:bg-zinc-950 hover:border hover:border-teal-500 hover:text-teal-500 transition-all duration-200"
          >
            Match Details
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3 my-2">
        <div className="w-16 h-16 overflow-hidden rounded-md border border-teal-500">
          <Image
            src={champIcon}
            height={200}
            width={200}
            className="scale-110"
            alt=""
            data-tooltip-id="champ_name"
            data-tooltip-content={champName}
          ></Image>
          <Tooltip id="champ_name" place="right" variant="light" />
        </div>
        <div>
          <Image
            src={role}
            height={30}
            width={30}
            alt=""
            className="border-teal-600 bg-zinc-900 border rounded-md p-1"
          ></Image>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div>
            <Image
              src={summoner1}
              height={30}
              width={30}
              alt=""
              className="border-teal-600 bg-zinc-900 border rounded-md"
            ></Image>
          </div>
          <div>
            <Image
              src={summoner2}
              height={30}
              width={30}
              alt=""
              className="border-teal-600 bg-zinc-900 border rounded-md"
            ></Image>
          </div>
        </div>
        <div className="block gap-3 bg-zinc-600 w-[2px] rounded-full h-full"></div>
        <div className="flex flex-col items-center gap-3">
          <div className="grid grid-cols-3 gap-3">
            {items.slice(0, 6).map((item, index) =>
              item !== 0 ? (
                <div key={index}>
                  <Image
                    src={
                      data[`item${index}`] !== 0
                        ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${
                            data[`item${index}`]
                          }.png`
                        : ``
                    }
                    height={30}
                    width={30}
                    alt=""
                    className="border-teal-600 bg-zinc-900 border rounded-md"
                  />
                </div>
              ) : (
                <div key={index}>
                  <div className="border-teal-600 text-xs font-thin bg-zinc-900 border rounded-md h-[30px] w-[30px] flex items-center justify-center">
                    -
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <div>
          {items.length > 6 &&
            (items[6] !== 0 ? (
              <div key={6}>
                <Image
                  src={
                    data[`item6`] !== 0
                      ? `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/item/${
                          data[`item6`]
                        }.png`
                      : ``
                  }
                  height={30}
                  width={30}
                  alt=""
                  className="border-teal-600 bg-zinc-900 border rounded-md"
                />
              </div>
            ) : (
              <div key={6}>
                <div className="border-teal-600 text-xs font-thin bg-zinc-900 border rounded-md h-[30px] w-[30px] flex items-center justify-center">
                  -
                </div>
              </div>
            ))}
        </div>
        <div className="flex flex-col items-center ml-4">
          <div>
            {data.kills} / {data.deaths} / {data.assists}
          </div>
          <div className="text-xs text-teal-400">
            {parseFloat(kda.toFixed(1))} KDA
          </div>
        </div>
        <div className="flex flex-col items-center ml-4">
          <div>{data.totalMinionsKilled} CS</div>
          <div className="text-xs text-teal-400">
            {parseFloat(cs_per_m.toFixed(2))} CS/M
          </div>
        </div>
        <div className="flex flex-col items-center ml-4">
          <div>{kill_part.toFixed(1)}% KP</div>
        </div>
        <div className="flex flex-col items-center ml-4 ">
          <div className="text-sm text-zinc-300">
            {data.wardsKilled} Wards Killed
          </div>
          <div className="text-sm text-zinc-300">
            {data.wardsPlaced} Wards Placed
          </div>
          <div className="text-sm text-zinc-300">
            {data.visionScore} Vis. Score
          </div>
        </div>
        <div className="flex flex-col items-center ml-4 min-w-20">
          <div className="flex flex-col gap-1">
            <div className="text-cyan-500 uppercase text-sm">Blue team</div>
            <div className="flex items-center gap-2">
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.blue_top.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
              {lol_champions.data[data.blue_top.champ_name].name}
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.blue_jungler.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
              {lol_champions.data[data.blue_jungler.champ_name]?.name || ""}
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.blue_mid.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
              {lol_champions.data[data.blue_mid.champ_name].name}
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.blue_bot.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
              {lol_champions.data[data.blue_bot.champ_name].name}
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.blue_sup.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
              {lol_champions.data[data.blue_sup.champ_name].name}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center ml-4 min-w-20">
          <div className="flex flex-col gap-1">
            <div className="text-red-500 uppercase text-sm text-right">
              Red team
            </div>
            <div className="flex justify-end items-center gap-2">
              {lol_champions.data[data.red_top.champ_name].name}
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.red_top.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
            </div>
            <div className="flex justify-end items-center gap-2">
              {lol_champions.data[data.red_jungler.champ_name].name}
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.red_jungler.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
            </div>
            <div className="flex justify-end items-center gap-2">
              {lol_champions.data[data.red_mid.champ_name].name}
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.red_mid.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
            </div>
            <div className="flex justify-end items-center gap-2">
              {lol_champions.data[data.red_bot.champ_name].name}
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.red_bot.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
            </div>
            <div className="flex justify-end items-center gap-2">
              {lol_champions.data[data.red_sup.champ_name].name}
              <Image
                src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/champions_icons/${data.red_sup.champ_name}.png`}
                height={20}
                width={20}
                alt=""
                className="border-cyan-500 bg-zinc-900 border rounded-md"
              ></Image>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfoBar;
