import {EnvironmentPreset} from 'omegga';

// ------ NAME is the weathers name,
// this is shown in server so be sure to make it good looking, you can add rich text if you want


// ------ CHANCE is the %chance of it confirming if it gets chose randomly out of the preset list,
// the plugin pulls a random env from the list, then compares between a random number 0-1 and the envs chance


// ------ TIME is the string time of day the weather should happen (NOT IMPLEMENTED)
// "day" = only at day, "night" = only at night, "both" = any time 


// ------ DYNAMICVARS is an object with key names equal to env keys but each contain a high and low limit for that env setting 
// single number variables like sunScale take 2 numbers in a object, a high and a low, 
// ex. sunScale:{hi:1.2, lo:0.5}
//
// multi number variables like colors take a hi and low for each color, 
// ex. fogColor: {r:{hi:0.6, lo:0.15}, g:{hi:0.5, lo:0.12}, b:{hi:1, lo:0.02}, a:{hi:0.6, lo:0.58}}
//
//
// You can bind numbers to the same random value in dynamicVars:
// single number variables you can make the hi equal to the index (starting at 1, not 0) of the variable in dynamicVars you want to link to times 100,
//   dynamicVars: {
//   sunScale: {hi:1.2, lo: 0.8}, skyIntensity:{hi:"sunScale", lo:0.2} skyIntensity will equal sunScale's random number
//   },
//
//
// multiple number variables the hi is equal to the name of a color before
//   dynamicVars: {
//   fogColor: {r:{hi:0.6, lo:0.15}, g:{hi:0.6, lo:0.15}, b:{hi:"r", lo:0.15}, a:{hi:"r", lo:0.15}} b and a will equal r's random number
//   },
//
//
// There are also special options for dyn variables, all allowing you to add - on front to do the opposite number of the chosen dynvar (as long as its 0-1)
// ex. hi:"-WeatherIntensity" or b:{hi:"-r". lo:0}, if r is 0.8, b is 0.2
//
// And COLOR DYN VARS can have a ! on front of the string to specify a different dyn var entirely than another color (doesnt seem to work)
// ex. r:{hi:"!WeatherIntensity". lo:0} or r:{hi:"!-WeatherIntensity". lo:0} 
//
// You can only bind to variables that are listed/generated BEFORE the binded one
// ex. r:{hi:0.5, lo:0.15}, g:{hi:300, lo:0.15}, b:{hi:0.2, lo:0.15} Binding g to b is not possible here as b isnt generated yet

// ENV is the environment preset (Not all data is required in every preset)

// You may delete any presets you dont care about and make new ones, just be sure to get the names and structure correct

  // ALLOWED RANGES FOR SKY VARIABLES
  // sunAngle 0-360
  // sunScale 0-5
  // sunlightColor 0-1, 0-1, 0-1, 0-1
  // skyIntensity 0-2?
  // skyColor 0-1, 0-1, 0-1, 0-1
  // moonScale 0-5
  // moonLightIntensity 0-2
  // moonLightColor 0-1, 0-1, 0-1, 0-1
  // starsIntensity 0-15
  // starsColor 0-1, 0-1, 0-1, 0-1
  // auroraIntensity 0-1
  // weatherIntensity 0-1
  // rainSnow 0-1
  // cloudCoverage 0-1
  // cloudSpeedMultiplier 0-5
  // precipitationParticleAmount 0-2
  // rainVolume 0-1
  // closeThunderVolume 0-1
  // distantThunderVolume 0-1
  // windVolume 0-1
  // clearFogDensity 0.005-3
  // cloudyFogDensity 0.005-3
  // clearFogHeightFalloff 0.01-5
  // cloudyFogHeightFalloff 0.01-5
  // fogColor 0-1, 0-1, 0-1, 0-1

  // ALLOWED RANGES FOR WATER VARIABLES
  // waterAbsorption 0-0.25, 0-0.25, 0-0.25
  // waterScattering 0-0.25, 0-0.25, 0-0.25
  // waterFogIntensity: 0-0.03
  // waterFogAmbientColor: 0-1, 0-1, 0-1, 0-1
  // waterFogAmbientScale: 0-4
  // waterFogScatteringColor: 0-1, 0-1, 0-1, 0-1
  // waterFogScatteringScale: 0-4

  // ALLOWED RANGES FOR GROUND PLATE
  // wip

  // Leave all 'a' as 1 because they make weird results when changed
const envPresets:{name:string, enabled:Boolean, chance:number, time:string, dynamicVars:{}, env:EnvironmentPreset}[] =
[
  {name:"Default", // this is identical to the default weather of brickadia
  enabled: true, // THis is just the base and example env, copy and paste this one if you want to easily make a new one. 
  chance:0.02, // 0-1           No env settings are required to be in a preset to function, you may remove what you dont need
  time:"day", 
  dynamicVars: // vars in dynamicvars do need the variable to be in env too though
  { 
    sunScale: {hi:1.2, lo: 0.8},
    sunlightColor: {r:{hi:1, lo:0.75}, g:{hi:0.8, lo:0.5}, b:{hi:"g", lo:0.15}, a:{hi:1, lo:1}},
  }, 
  env:{data:{groups:{
    Sky:
    {
      sunScale: 0.85, 
      sunHorizonScaleMultiplier: 1,
      sunlightColor: {r:1,g:0.807,b:0.768,a:1}, 
      skyIntensity: 1, 
      skyColor: {r:0,g:0.171,b:1,a:1}, 
      moonScale: 0.7,
      moonlightIntensity: 1,
      moonlightColor: {r:0.518,g:0.6,b:0.867,a:1}, 
      starsIntensity: 1,
      starsColor: {r:0.749,g:0.851,b:1,a:1}, 
      auroraIntensity: 0,
      weatherIntensity: 0,
      rainSnow: 0,
      cloudCoverage: 0.38,
      cloudSpeedMultiplier: 1,
      precipitationParticleAmount: 1,
      bCloseLightning: true,
      rainVolume: 0.65,
      closeThunderVolume: 1,
      distantThunderVolume: 0.4,
      windVolume: 0.65,
      clearFogDensity: 0.01,
      cloudyFogDensity: 0.25,
      clearFogHeightFalloff: 0.09,
      cloudyFogHeightFalloff: 0.04,
      fogColor: {r:0.503,g:0.68,b:1,a:1},
    }, 
    Water:
    {
      waterAbsorption: {x: 0.0065,y:0.0007,z:0.00019}, 
      waterScattering: {x:0.000007,y:0.000018,z:0.000031}, 
      waterFogIntensity: 0.0002,
      waterFogAmbientColor: {r:0.1,g:0.41,b:0.75,a:1}, 
      waterFogAmbientScale: 0.25, 
      waterFogScatteringColor: {r:0.000007,g:0.000018,b:0.000031,a:1}, 
      waterFogScatteringScale: 3,
    },
  }}}},

  {name:"Clear", enabled: true, chance:0.4, time:"both", dynamicVars:
  {
    sunlightColor: {r:{hi:1, lo:0.75}, g:{hi:0.8, lo:0.5}, b:{hi:"g", lo:0.15}, a:{hi:1, lo:1}},
    skyColor: {r:{hi:0.1, lo:0}, g:{hi:0.2, lo:0.15}, b:{hi:1, lo:0.9}, a:{hi:1, lo:1}},
  },
  env:{data:{groups:{Sky:
    {
      sunScale: 1.2, sunlightColor:{r:0.8,g:0.743,b:0.648,a:1}, skyIntensity:1, skyColor:{r:0.6,g:0.9,b:0.98,a:1}, 
      weatherIntensity:0, rainSnow:0, cloudCoverage: 0.3, cloudSpeedMultiplier: 1, precipitationParticleAmount: 0, windVolume: 0,
      clearFogDensity:0.01,  cloudyFogDensity: 0.25, fogColor:{r:0.503,g:0.68,b:1,a:1}, moonlightIntensity: 1.5,
    },
  }}}},

  // {name:"Sunny", enabled: true, chance:0.4, time:"day", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, skyColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},
  
  // {name:"Overcast", enabled: true, chance:0.4, time:"both", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},

  {name:"Rain", enabled: true, chance:0.33, time:"both", 
  dynamicVars:
    {
      weatherIntensity: {hi: 0.65, lo: 0.2}, cloudCoverage: {hi:1, lo:0.53}, 
      fogColor: {r:{hi:"!weatherIntensity", lo:0.15}, g:{hi:"r", lo:0.15}, b:{hi:"r", lo:0.15}, a:{hi:1, lo:1}}
    },
  env:{data:{groups:{Sky:
    {
      sunScale: 0.85, sunlightColor:{r:1,g:1,b:1,a:0.3}, skyIntensity:1, skyColor:{r:0.2,g:0.2,b:0.4,a:1}, 
      weatherIntensity:0.5, rainSnow:0, cloudCoverage: 0.3, cloudSpeedMultiplier: 1, precipitationParticleAmount: 1, rainVolume: 0.6, windVolume: 0,
      clearFogDensity:0.165,  cloudyFogDensity: 0.4, cloudyFogHeightFalloff: 0.1, fogColor:{r:0.503,g:0.68,b:1,a:0.2}, moonlightIntensity: 1.5, moonScale: 1.2
    },
  }}}},
  
  // {name:"Storm", enabled: true, chance:0.2, time:"both", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},
  
  // {name:"Flood", enabled: true, chance:0.15, time:"both", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},

  // {name:"Snow", enabled: true, chance:0.25, time:"both", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},
  
  // {name:"Blizzard", enabled: true, chance:0.15, time:"both", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},
  
  // {name:"Heat Wave", enabled: true, chance:0.15, time:"day", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},

  // {name:"Toxic Fallout", enabled: true, chance:0.05, time:"day", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},
  
  // {name:"Eclipse", enabled: true, chance:0.05, time:"day", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},

  {name:"Blackout", enabled: false, chance:0.03, time:"day", 
  dynamicVars:
    {
      fogColor: {r:{hi:0.8, lo:0.66}, g:{hi:0.5, lo:0}, b:{hi:"g", lo:0},a:{hi:1, lo:1}}
    },
  env:{data:{groups:{Sky:
    {
      sunScale: 1, sunlightColor:{r:0,g:0,b:0,a:1}, moonlightColor:{r:0,g:0,b:0,a:1}, skyIntensity:0.03, skyColor:{r:1,g:1,b:1,a:1}, 
      weatherIntensity:0, rainSnow:0, cloudCoverage: 0, cloudSpeedMultiplier: 0, precipitationParticleAmount: 0, windVolume: 0,
      clearFogDensity:0.01,  cloudyFogDensity: 0.25, fogColor:{r:0.569,g:0,b:0.23,a:1}
    }
  }}}},
  
  // {name:"Blood Moon", enabled: true, chance:0.02, time:"night", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},

  // {name:"Void Moon", enabled: true, chance:0.02, time:"night", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},
  
  // {name:"Radiant Moon", enabled: true, chance:0.02, time:"night", 
  // env:{data:{groups:{Sky:{sunScale: 1, skyIntensity:1, sunColor:{r:1,g:1,b:1,a:1},weatherIntensity:0}}}}},

]
export default envPresets;