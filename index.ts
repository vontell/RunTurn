import {RGBot} from 'rg-bot'
import RGCTFUtils, {CTFEvent} from 'rg-ctf-utils'
import {Vec3} from 'vec3'
import {Item} from 'prismarine-item'
import {Entity} from 'prismarine-entity'

import {
    handleAttackFlagCarrier,
    handleAttackNearbyOpponent,
    handleBotIdlePosition,
    handleCollectingFlag,
    handleLootingItems, handleLowHealth,
    handlePlacingBlocks, handleScoringFlag
} from './lib/MainLoopFunctions';

const armorManager = require('mineflayer-armor-manager')

const {
    getUnbreakableBlockIds,
    nearestTeammates,
    throttleRunTime,
    nameForItem
} = require('./lib/HelperFunctions')


let rgctfUtils = null
let unbreakable = null

/**
 * This capture the flag bot covers most possibilities you could have in a main loop bot.
 * Macro level strategies and tuning are up to you.
 */
export function configureBot(bot: RGBot) {

    // Disable rg-bot debug logging.  You can enable this to see more details about rg-bot api calls
    bot.setDebug(false)

    // Allow parkour so that our bots pathfinding will jump short walls and optimize their path for sprint jumps.
    bot.allowParkour(true)

    // We recommend disabling this on as you can't dig the CTF map.  Turning this on can lead pathfinding to get stuck.
    bot.allowDigWhilePathing(false)

    // Setup the rg-ctf-utils with debug logging
    rgctfUtils = new RGCTFUtils(bot)
    rgctfUtils.setDebug(true)

    // Load the armor-manager plugin (https://github.com/PrismarineJS/MineflayerArmorManager)
    bot.mineflayer().loadPlugin(armorManager)

    // Information about the unbreakable block types
    unbreakable = getUnbreakableBlockIds(bot)
    console.log(`Unbreakable blocks: ${JSON.stringify(unbreakable)}`)

}

export function runTurn(bot: RGBot) {
    console.log("Hello!")
}

// export async function runTurn(bot: RGBot) {

//     try {

//         await bot.waitForMilliseconds(8000);

//         // find out which team I'm on
//         const myTeamName: string = bot.getMyTeam()
//         const otherTeamName: string = bot.matchInfo().teams.find(t => t.name != myTeamName)?.name

//         // get my current position and log information about my state
//         const myPosition: Vec3 = bot.position()
//         console.log(`My team: ${myTeamName}, my position: ${bot.vecToString(myPosition)}, my inventory: ${JSON.stringify(bot.getAllInventoryItems().map((item) => nameForItem(item)))}`)

//         // find any opponents in range
//         const opponentNames: string[] = bot.getOpponentUsernames()
//         const opponents: Entity[] = bot.findEntities({
//             // opNames can be empty in practice mode where there is no other team
//             // if we don't pass some array to match, then this will return all entities instead
//             entityNames: (opponentNames.length == 0 && ['...']) || opponentNames,
//             attackable: true,
//             maxCount: 3,
//             maxDistance: 33, // Bots can only see ~30 +/1 blocks, so no need to search far
//             // override the default value function here as we aren't using this value in the sortValueFunction
//             entityValueFunction: (entityName) => {
//                 return 0
//             },
//             // just sort them by distance for now... We'll filter them by decision point later
//             sortValueFunction: (distance, entityValue, health = 0, defense = 0, toughness = 0) => {
//                 return distance
//             }
//         }).map(fr => fr.result)

//         // find any teammates in range
//         const teamMates: Entity[] = nearestTeammates(bot, 33, true)

//         // equip my best armor
//         bot.mineflayer().armorManager.equipAll()

//         // Only take 1 action per main loop pass.  There are exceptions, but this is best practice as the
//         // game server can only process so many actions per tick
//         let didSomething: boolean = false

//         if (!didSomething) {
//             // Check if I'm low on health
//             didSomething = await handleLowHealth(bot, rgctfUtils, opponents, teamMates)
//         }

//         if (!didSomething) {
//             // if someone has the flag, hunt down player with flag if it isn't a team-mate
//             didSomething = await handleAttackFlagCarrier(bot, rgctfUtils, opponents, teamMates)
//         }

//         if (!didSomething) {
//             // do I need to attack a nearby opponent
//             didSomething = await handleAttackNearbyOpponent(bot, rgctfUtils, opponents, teamMates)
//         }

//         if (!didSomething) {
//             // if I have the flag, go score
//             didSomething = await handleScoringFlag(bot, rgctfUtils, opponents, teamMates)
//         }

//         if (!didSomething) {
//             // go pickup the loose flag
//             didSomething = await handleCollectingFlag(bot, rgctfUtils, opponents, teamMates)
//         }

//         if (!didSomething) {
//             // If no-one within N blocks, place blocks
//             didSomething = await handlePlacingBlocks(bot, rgctfUtils, opponents, teamMates)
//         }

//         if (!didSomething) {
//             // see if we can find some items to loot
//             didSomething = await handleLootingItems(bot, rgctfUtils, opponents, teamMates)
//         }

//         if (!didSomething) {
//             // we had nothing to do ... move towards the middle
//             didSomething = await handleBotIdlePosition(bot, rgctfUtils, opponents, teamMates)
//         }

//     } catch (ex) {
//         // if we get anything other than a pathfinding change error, log it so that we can fix our bot
//         if (!(ex.toString().includes('GoalChanged') || ex.toString().includes('PathStopped'))) {
//             console.warn(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
//             console.warn(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
//             console.warn(`Error during bot execution`, ex)
//             console.warn(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
//             console.warn(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
//             await bot.wait(20) // wait 1 seconds before looping again to avoid tight loops on errors
//         }
//     }

// }