#!/usr/bin/env bash

# if locate "custompresets.ts"
# then
# else
#   cat > "custompresets.ts" << EOF 
#   import {EnvironmentPreset} from 'omegga';

#   const envPresets:{name:string, enabled:Boolean, chance:number, time:string, dynamicVars:{}, env:EnvironmentPreset}[] =
#   [
#     {name:"Template",
#     enabled: true,
#     chance:0.2,
#     time:"day", 
#     dynamicVars:
#     { 

#     }, 
#     env:{data:{groups:{
#       Sky:
#       {

#       }, 
#       Water:
#       {

#       },
#     }}}},
    
#   ]
#   export default envPresets;
#   EOF
# fi