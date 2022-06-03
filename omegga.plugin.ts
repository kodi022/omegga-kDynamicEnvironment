import envPresets from './presets'; // if you want your own custom presets file, replace the name here to use it like './filename'
import OmeggaPlugin, { OL, PS, PC, EnvironmentPreset, OmeggaPlayer } from 'omegga';
type Config = { foo: string };
type Storage = { bar: string };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL; config: PC<Config>; store: PS<Storage>;
  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store; 
  }

  // TO-DO
  // toggle to change weather using name by command rather than automatic
  // add last dynvar link thing
  // add option to use store env presets only by saving current env into store (easy to use, much less control)
  // change presets to independent jsons/files in a presets folder

  async init() {
    const startOn: boolean = this.config["Start-Enabled"];
    const debug: boolean = this.config["Enable-Debug"];
    const auth: OmeggaPlayer[] = this.config["Authorized-Users"];
    const enableBroadcast = this.config["Enable-Broadcasts"];
    const continueDynVarReroll = this.config["Continue-Weather-Dynvar-Reroll"];
    
    const dayLength: number = this.config["Day-Length"] * 240;
    const nightLength: number = this.config["Night-Length"] * 240; // * 240 is useful for on tick related stuff

    const useWeather: boolean = this.config["Use-Plugin-Weather"];
    const weatherChangesPerDay:number = this.config["Weather-Changes-Per-Day"];
    const weatherChangeMinVariance: number = this.config["Weather-Change-Minute-Variance"] * 240;
    const weatherTransitionMins: number = this.config["Weather-Transition-Time"] * 60; // * 60 is useful for 

    const useWater: boolean = this.config["Use-Plugin-Water"];
    const waterDefaultHeight: number = this.config["Water-Default-Height"];
    const waterTideRange: number = this.config["Water-Tide-Range"];
    const waterFloodMax: number = this.config["Water-Flood-Max"];

    const presets = envPresets;

    let timeOfDay: number = 6; // 0-24
    const dayNightLength:number = nightLength === 0 ? dayLength + nightLength : dayLength;
    let waterHeight: number = waterDefaultHeight;
    let floodAdd: number = 0;

    // loop variables
    let loopInterval: number = 0;
    let lerpTick: number = 0;
    let tick: number = 0;
    let randIndex: number = 0;
    let envName: string = presets[0].name;

    const ChangeVariance = () => {
      let nermber: number = Math.floor((Math.random() * 2 - 1) * weatherChangeMinVariance);
      if (nermber < 0) nermber = 0;
      return nermber;
    }
    let changeVariance: number = ChangeVariance();

    // 4 tick a second, so 240 ticks a minute, 7200 ticks in 30 minutes, 14400 ticks in hour
    const Loop = () => {
      loopInterval = setInterval(async () => {
        tick++;

        // 4 times second update
        if (dayLength > 0) ChangeTime();

        if (useWeather) { // once per 2 second // 20
          if (tick % 2 === 0) {
            if (lerpTick < weatherTransitionMins) LerpEnv();
          }
        }
        
        if (useWater) { 
          if (tick % 20 === 0) { // one every 5 second update
            if (waterTideRange !== 0) WaterUpdate();
            if (waterFloodMax !== 0 && curEnv.data.groups.Sky.weatherIntensity > 0.8) Flood();
          }
        }

        if (useWeather) { // Around half a day changing
          if (tick % Math.floor((dayNightLength / weatherChangesPerDay) + changeVariance) <= 0) {
            NextEnv();
          }
        }
      }, 250)
    }

    const WaterUpdate = () => {
      waterHeight = (Math.sin(((timeOfDay) - 8) * 1.909) * waterTideRange) + waterDefaultHeight + floodAdd;
      Omegga.loadEnvironmentData({Water:{waterHeight: waterHeight}});
    }

    function Flood() {
      floodAdd = (curEnv.data.groups.Sky.weatherIntensity - 0.8) * 5 * waterFloodMax;
    }

    const ChangeTime = () => {
      if (nightLength === 0) {
        (timeOfDay < 6 || timeOfDay > 18) 
        ? timeOfDay += 240 / (20 * nightLength)
        : timeOfDay += 240 / (20 * dayLength)
      } else {
        (timeOfDay < 6 || timeOfDay > 18) 
        ? timeOfDay = 6
        : timeOfDay += 240 / (20 * dayLength)
      }
      timeOfDay = timeOfDay % 24;
      Omegga.loadEnvironmentData({Sky:{timeOfDay: timeOfDay}});
    }

    let goalEnv: EnvironmentPreset = presets[0].env;
    let curEnv: EnvironmentPreset = presets[0].env;
    let bufferVars = {};

    const LerpEnv = () => {      
      lerpTick++;
      if (debug || lerpTick % 10 == 0) Omegga.broadcast(`Lerping ${lerpTick}`);
      let bufferKeys = Object.keys(bufferVars);
      let curGroups = curEnv.data.groups;
    
      for (let group of Object.keys(curGroups)) for (let key of Object.keys(curGroups[group])) {
        if (bufferKeys.find(p => p === key)) {
          let e = Object.keys(bufferVars[key]);
          if (e.length > 1) {
            for (let color of e) {
              curGroups[group][key][color] += bufferVars[key][color];
            } 
          } else {
            curGroups[group][key] += bufferVars[key];
          }
        }
      }
      Omegga.loadEnvironmentData(curEnv);  
    }

    const NextEnv = async () => {
      if (debug) Omegga.broadcast("Rolling for new env (NextEnv)");
      changeVariance = ChangeVariance();
    
      while (true) { // loops until a env preset passes
        randIndex = Math.floor(Math.random() * (presets.length));
        if (Math.random() < presets[randIndex].chance) { // gets a env, then runs another random to see if it passes, else try again
          if (continueDynVarReroll) {
            lerpTick = 0;
            bufferVars = {};
            goalEnv = Object.assign(presets[randIndex].env);
            if (enableBroadcast) Omegga.broadcast(`Continuing ${presets[randIndex].name} weather (with reroll)`);
          } else if (envName === presets[randIndex].name) {
            if (enableBroadcast) Omegga.broadcast(`Continuing ${presets[randIndex].name} weather`);
            return;
          } else {
            lerpTick = 0;
            bufferVars = {};
            envName = presets[randIndex].name;
            goalEnv = Object.assign(presets[randIndex].env);
            if (enableBroadcast) Omegga.broadcast(`Switching to ${presets[randIndex].name} weather`);
          }
          break;
        } else continue;
      }
      EnvGen();
    }

    const EnvGen = () => {
      if (debug) Omegga.broadcast("Generating new env vars (EnvGen)");
      let goalGroups = goalEnv.data.groups; // env groups of goal env
      let curGroups = curEnv.data.groups; // env groups of current env
      let dynVars = presets[randIndex].dynamicVars;
      let dynKeys = Object.keys(dynVars);

      for (let group of Object.keys(goalGroups)) // loop env groups 
      for (let key of Object.keys(goalGroups[group])) { // then loop through keys in env group     
        let curGoalVar = goalGroups[group][key]; // var of goal env
        let curEnvVar = curGroups[group][key]; // var of current env
        if (dynKeys.find(p => p === key)) {
          let dynVarKeys = Object.keys(dynVars[key]);
          if (dynVarKeys.length > 2) { // IS DYNCOLOR
            bufferVars[key] = {};
            for (let color of dynVarKeys) {
              if (typeof dynVars[key][color].hi === "string") { // DYNCOLOR WITH STRING
                let index: String = dynVars[key][color].hi; //color
                if (index.startsWith("!")) { // probably not working
                  index = index.slice(1);
                  if (index.startsWith("-")) {
                    index = index.slice(1);
                    bufferVars[key][color] = DynVarLinkReverse(goalGroups[group][index], curEnvVar[color]);       
                  } else {
                    bufferVars[key][color] = DynVarLink(goalGroups[group][index], curEnvVar[color]);
                  }
                } else {
                  if (index.startsWith("-")) {
                    index = index.slice(1);
                    bufferVars[key][color] = DynVarLinkReverse(curEnvVar[color], curGoalVar[index]);
                  } else {
                    bufferVars[key][color] = DynVarLink(curGoalVar[index], curEnvVar[color]);
                  }
                }
                continue;
              } else { // DYNCOLOR NOT STRING
                bufferVars[key][color] = DynVar(dynVars[key][color], curGoalVar[color], curEnvVar[color]);
              }
            }
          } else // IS DYNVAR
          {
            if (typeof dynVars[key].hi === "string") { // DYNVAR WITH STRING
              let index: String = dynVars[key].hi;
              if (index.startsWith("-")) { // DYNVAR WITH - INVERT
                index = index.slice(1);
                bufferVars[key] = DynVarLinkReverse(curGoalVar[index], curEnvVar);
              } else { // DYNVAR WITHOUT - INVERT
                bufferVars[key] = DynVarLink(curGoalVar[index], curEnvVar);
              }
              continue;
            } else {
              bufferVars[key] = DynVar(dynVars[key], curGoalVar, curEnvVar);
            }
          }
        } else { // IS NORMAL VAR
          let varKeys = Object.keys(curGoalVar);
          if (varKeys.length < 2) { // VAR IS SINGLE
            bufferVars[key] = (curGoalVar - curEnvVar) / weatherTransitionMins;
          } else { // VAR IS COLOR
            bufferVars[key] = {};
            for (let color of varKeys) {
              bufferVars[key][color] = (curGoalVar[color] - curEnvVar[color]) / weatherTransitionMins;
            }
          }
        }
      }
    }

    function DynVar(range:{hi:number, lo:number}, goal: number, current: number) { // just generate a normal dynvar
      goal = RandomRange(range.hi, range.lo);
      return (goal - current) / weatherTransitionMins;
    }
    function DynVarLink(goal: number, current: number) { // when a variable is linked to another variable 
      return (goal - current) / weatherTransitionMins;
    }
    function DynVarLinkAdd(goal: number, current: number, add: boolean, addNum: number) { // as above but offsetting a set amount 
      if (add) {
        return ((goal - current) / weatherTransitionMins) + addNum;
      } else {
        return ((goal - current) / weatherTransitionMins) - addNum;
      }
    }
    function DynVarLinkReverse(goal: number, current: number) { // 
      let goalReversed = 1 - goal; // yea it only works with colors mostly, im lazy
      return (goalReversed - current) / weatherTransitionMins;
    }

    const SunAngle = () => { // possible future feature
    
    }

    Omegga.on('cmd:env', (name: string, value1: string) => {
      if (auth.find(p => p.name === name)) {
        switch (value1) {
          case "start": {
            clearInterval(loopInterval);
            Loop();
            Omegga.whisper(name, "Starting dynamic env...");
            break;
          }
          case "stop": {
            clearInterval(loopInterval);
            Omegga.whisper(name, "Stopping dynamic env...");
            break;
          }
          case "debug": {
            Omegga.whisper(name, "ping back, command doesnt do anything else");
          }
          case "print": {
            console.log(curEnv);
            Omegga.whisper(name, "Printed some of current Env to console");
          }
          default: {
            Omegga.whisper(name, "Available options for <code>/env option</> are");
            Omegga.whisper(name, "start, stop, debug");
          }
        }
      } else
      {
        switch (value1) {
          default: {
            Omegga.whisper(name, "No commands are available to you.");
            //Omegga.whisper(name, "start, stop, debug");
          }
        }
      }
    })
    

    function Clamp(value: number, maxValue: number, minValue: number): number {
      return Math.min(Math.max(value, minValue), maxValue);
    }
    function RandomRange(hi: number, lo: number): number {
      return (Math.random() * (hi - lo)) + lo;
    }
    function Err(str: string) {
      console.error(str);
    }

    if (startOn) Loop(); 
    return { registeredCommands: ['env'] };
  }
  async stop() {}
}