
# kDynamicEnvironment

A typed safe plugin for [omegga](https://github.com/brickadia-community/omegga).

Automatically changes to random selected weather presets

Using presets in presets.ts, the environment can randomly switch between environments and environment presets can have random variables inside themselves

Missing some more key features and has non functional ones still, WIP.

## Install

`omegga install gh:Kodi022/kDynamicEnvironment`

Tweak presets.ts to your liking or leave it default. There is lots of comments inside it to guide you through tweaking and there is more info in the Usage section below.

## Usage/Presets

You may add and remove presets as you wish but there are a few limits you must follow:

This is the minimum required in a preset:
```
  {name:"No Change", enabled: true, chance:0.9, time:"both", dynamicVars:{},
  env:{data:{groups:{}}}},
```

Any environment variable you add inside is case sensitive and require a number value and colors must to have `{r: number, g: number, b:number, a:number}` value
It will do absolutely nothing other than pause the environment as is until another is chosen

This is a full environment preset imitating brickadia's default environment with some dynamic variables (those are explained below):
```
  {name:"Default", enabled: true, chance:0.5, time:"day", 
  dynamicVars: 
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
  ```
  You can even edit the groundplate by adding `GroundPlate:{},` after the `Water` section

  Try not to mess with the 'a' in color variables, leave it as 1. It produces strange color behavior when changed

### Dynamic Variables
Here is the explanation of dynamic variables copied from the presets.ts:
  
 ------ DYNAMICVARS is an object with key names equal to env keys but each contain a high and low limit for that env setting 
 single number variables like sunScale take 2 numbers in a object, a high and a low, 
 ex. `sunScale:{hi:1.2, lo:0.5}`

 multi number variables like colors take a hi and low for each color, 
 ex. `fogColor: { r:{hi:0.6, lo:0.15}, g:{hi:0.5, lo:0.12}, b:{hi:1, lo:0.02}, a:{hi:1, lo:1} }`


 You can bind numbers to the same random value in dynamicVars:
 single number variables you can make the hi equal to the index (starting at 1, not 0) of the variable in dynamicVars you want to link to times 100,
  ```
   dynamicVars: {
   sunScale: {hi:1.2, lo: 0.8}, skyIntensity:{hi:"sunScale", lo:0.2} 
   },
  ```
 skyIntensity will equal sunScale's random number

 in multiple number variables the hi is equal to the string name of a color before
  ```
   dynamicVars: {
   fogColor: {r:{hi:0.6, lo:0.15}, g:{hi:"r", lo:0.15}, b:{hi:"r", lo:0.15}, a:{hi:1, lo:1}} 
   },
  ```
 g and b will equal r's random number

 There are also special options for dyn variables, all allowing you to add - on front to do the opposite number of the chosen dynvar (works best for colors or 0-1 variables)
 ex. `sunScale:{hi:"-WeatherIntensity", lo:0}` or `b:{hi:"-r". lo:0}`, if r is 0.8, b is 0.2

 And COLOR DYN VARS can have a ! on front of the string to specify a different dyn var entirely than another color (doesnt seem to work)
 ex. `r:{hi:"!WeatherIntensity". lo:0}` or `r:{hi:"!-WeatherIntensity". lo:0}` 

 You can only bind to variables that are listed/generated BEFORE the binded one
 ex. `r:{hi:"g", lo:0.15}, g:{hi:0.2, lo:0.15}` Binding r to g is not possible here as r is before g and thus isnt generated yet

## Known bugs
  - Using ambience settings in a preset will crash plugin
