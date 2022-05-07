import OmeggaPlugin, { OL, PS, PC, BRColor, EnvironmentPreset, _OMEGGA_UTILS_IMPORT } from 'omegga';
import envPresets from './presets';
type Config = { foo: string };
type Storage = { bar: string };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;
  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store; }

  async init() 
  {
    const presets = envPresets;
    const debug: boolean = this.config["Enable-Debug"];
    const auth = this.config["Authorized-Users"];
    const continueReroll = this.config["Continue-Weather-Dynvar-Reroll"];
    const toggleDayNight: boolean = this.config["Day-Night-Cycle"];
    const toggleNight: boolean = this.config["Allow-Night"];
    const dayLength: number = this.config["Day-Length"] * 240;
    const nightLength: number = this.config["Night-Length"] * 240;
    const weatherChangeTime:number = this.config["Weather-Changes-Per-Day"];
    const weatherTimeVariance: number = this.config["Weather-Change-Time-Variance"] * 240;
    const weatherTransitionTime: number = this.config["Weather-Transition-Time"] * 60;
    const useWater: boolean = this.config["Use-Plugin-Water"];
    const waterDefaultHeight = this.config["Water-Default-Height"];
    const waterTideRange = this.config["Water-Tide-Range"];
    const waterFloodMax = this.config["Water-Flood-Max"];

    let timeOfDay: number = 6; // 0-24
    let dayNightLength:number = (toggleNight) ? dayLength + nightLength : dayLength;
    let waterHeight: number = waterDefaultHeight;
    let floodAdd: number = 0;

    // loop variables
    let running: boolean = true;
    let lerpTick: number = 0;
    let tick: number = 0;
    let randIndex: number = 0;
    let envName: string = presets[0].name;
    let changeVariance: number = Math.floor((Math.random() * weatherTimeVariance) - (weatherTimeVariance / 5));

    // 4 tick a second, so 240 ticks a minute, 7200 ticks in 30 minutes, 14400 ticks in hour
    const Loop = () => 
    {
      let interval = setInterval(async () => 
      {
        if (!running) clearInterval(interval);
        tick++;

        // 4 times second update 
        if (toggleDayNight) ChangeTime();

        if (tick % 2 == 0) // once per 2 second // 20
        {
          if (lerpTick < weatherTransitionTime) LerpEnv();
        }
        
        if (tick % 20 == 0) // one every 5 second update
        {
          if (useWater && waterTideRange != 0) WaterUpdate();
          if (waterFloodMax != 0 && curEnv.data.groups.Sky.weatherIntensity > 0.8) Flood();
        }

        if (tick % Math.floor(((dayNightLength) / weatherChangeTime) + changeVariance) == 0) // Around half a day changing
        {
          NextEnv();
        }
      }, 250)
    }

    const WaterUpdate = () =>
    {
      waterHeight = (Math.sin(((timeOfDay) - 8) * 1.909) * waterTideRange) + waterDefaultHeight + floodAdd;
      this.omegga.loadEnvironmentData({Water:{waterHeight: waterHeight}});
    }
    function Flood() 
    {
      floodAdd = (curEnv.data.groups.Sky.weatherIntensity - 0.8) * 5 * waterFloodMax;
    }
    const ChangeTime = () => 
    {
      if (toggleNight) 
      {
        (timeOfDay < 6 || timeOfDay > 18) 
        ? timeOfDay += 240 / (20 * nightLength)
        : timeOfDay += 240 / (20 * dayLength)
      } else 
      {
        (timeOfDay < 6 || timeOfDay > 18) 
        ? timeOfDay = 6
        : timeOfDay += 240 / (20 * dayLength)
      }
      timeOfDay = timeOfDay % 24;
      this.omegga.loadEnvironmentData({Sky:{timeOfDay: timeOfDay}});
    }

    let origEnv: EnvironmentPreset =  presets[0].env;
    let goalEnv: EnvironmentPreset = origEnv;//presets[0].env;
    let curEnv: EnvironmentPreset = origEnv;//presets[0].env;
    let bufferVars = {};

    const LerpEnv = () => 
    {      
      let bufferKeys = Object.keys(bufferVars);
      let curGroups = curEnv.data.groups;
      lerpTick++;
      for (let group of Object.keys(curGroups)) for (let key of Object.keys(curGroups[group])) 
      {
        if (bufferKeys.find(p => p === key))
        {
          let e = Object.keys(bufferVars[key]);
          if (e.length > 1) 
          {
            for (let color of e) 
            {
              curGroups[group][key][color] += bufferVars[key][color];
            } 
          } else 
          {
            curGroups[group][key] += bufferVars[key];
          }
        }
      }
      this.omegga.loadEnvironmentData(curEnv);  
    }

    const NextEnv = async () => 
    {
      changeVariance = Math.floor((Math.random() * weatherTimeVariance) - (weatherTimeVariance / 5));
      let continu: boolean = false;
    
      while (true) // loops until a env preset passes
      {
        randIndex = Math.floor(Math.random() * (presets.length));
        if (Math.random() < presets[randIndex].chance)  // gets a env, then runs another random to see if it passes, else try again
        {
          if (envName === presets[randIndex].name) 
          {
            this.omegga.broadcast(`Continuing ${presets[randIndex].name} weather`);
            continu = true;
          } else 
          {
            lerpTick = 0;
            bufferVars = {};
            envName = presets[randIndex].name;
            goalEnv = Object.assign(presets[randIndex].env);
            this.omegga.broadcast(`Switching to ${presets[randIndex].name} weather`);
          }
          break;
        } else continue;
      }
      if (!continu || continueReroll) EnvGen();
    }

    const EnvGen = () => 
    {
      let goalGroups = goalEnv.data.groups; // env groups of goal env
      let curGroups = curEnv.data.groups; // env groups of current env
      let dynVars = presets[randIndex].dynamicVars;
      let dynKeys = Object.keys(dynVars);

      for (let group of Object.keys(goalGroups)) // loop env groups 
      for (let key of Object.keys(goalGroups[group])) // then loop through keys in env group
      {
        let curGoalVar = goalGroups[group][key]; // var of goal env
        let curEnvVar = curGroups[group][key]; // var of current env
        if (dynKeys.find(p => p === key))
        {
          let dynVarKeys = Object.keys(dynVars[key]);
          if (dynVarKeys.length > 2) // IS DYNCOLOR
          {
            bufferVars[key] = {};
            for (let color of dynVarKeys) 
            {
              if (typeof dynVars[key][color].hi === "string") // DYNCOLOR WITH STRING
              {
                let index: String = dynVars[key][color].hi; //color
                if (index.startsWith("!")) // probably not working
                {
                  index = index.slice(1);
                  if (index.startsWith("-"))
                  {
                    index = index.slice(1);
                    bufferVars[key][color] = DynVarLinkReverse(goalGroups[group][index], curEnvVar[color]);       
                  } else
                  {
                    bufferVars[key][color] = DynVarLink(goalGroups[group][index], curEnvVar[color]);
                  }
                } else
                {
                  if (index.startsWith("-"))
                  {
                    index = index.slice(1);
                    bufferVars[key][color] = DynVarLinkReverse(curEnvVar[color], curGoalVar[index]);
                  } else
                  {
                    bufferVars[key][color] = DynVarLink(curGoalVar[index], curEnvVar[color]);
                  }
                }
                continue;
              } else // DYNCOLOR NOT STRING
              {
                bufferVars[key][color] = DynVar(dynVars[key][color], curGoalVar[color], curEnvVar[color]);
              }
            }
          } else // IS DYNVAR
          {
            if (typeof dynVars[key].hi === "string") // DYNVAR WITH STRING
            {
              let index: String = dynVars[key].hi;
              if (index.startsWith("-")) // DYNVAR WITH - INVERT
              {
                index = index.slice(1);
                bufferVars[key] = DynVarLinkReverse(curGoalVar[index], curEnvVar);
              } else // DYNVAR WITHOUT - INVERT
              {
                bufferVars[key] = DynVarLink(curGoalVar[index], curEnvVar);
              }
              continue;
            } else 
            {
              bufferVars[key] = DynVar(dynVars[key], curGoalVar, curEnvVar);
            }
          }
        } else // IS NORMAL VAR
        {
          let varKeys = Object.keys(curGoalVar);
          if (varKeys.length < 2) // VAR IS SINGLE
          {
            bufferVars[key] = (curGoalVar - curEnvVar) / weatherTransitionTime;

          } else // VAR IS COLOR
          {
            bufferVars[key] = {};
            for (let color of varKeys) 
            {
              bufferVars[key][color] = (curGoalVar[color] - curEnvVar[color]) / weatherTransitionTime;
            }
          }
        }
      }
    }

    function DynVar(range:{hi:number, lo:number}, goal: number, current: number) 
    {
      goal = RandomRange(range.hi, range.lo);
      return (goal - current) / weatherTransitionTime;
    }
    function DynVarLink(goal: number, current: number) 
    {
      return (goal - current) / weatherTransitionTime;
    }
    function DynVarLinkReverse(goal: number, current: number) 
    {
      let goalReversed = 1 - goal; // yea it only works with colors mostly, im lazy
      return (goalReversed - current) / weatherTransitionTime;
    }

    const SunAngle = () => 
    {

    }


    this.omegga.on('cmd:env', (name:string) => 
    {
      if (debug) 
      {
        console.log(curEnv.data.groups.Sky);
        this.omegga.whisper(name, "Printed some debug to console");
      } else 
      {
        this.omegga.whisper(name, "Debug not enabled");
      }
    })
    

    function Clamp(value: number, maxValue: number, minValue: number): number
    {
      return Math.min(Math.max(value, minValue), maxValue);
    }
    function RandomRange(hi: number, lo: number): number
    {
      return (Math.random() * (hi - lo)) + lo;
    }
    function Err(str: string) 
    {
      console.error(str);
    }

    Loop(); 
    return { registeredCommands: ['env'] };
  }
  async stop() {}
}