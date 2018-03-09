const _ = require('lodash')

function formatMiliseconds (time) {
  let res = {
    seconds: 0,
    minutes: 0,
    hours: 0
  }

  time = ~~(time / 1000)

  res.seconds = time % 60
  time = ~~(time / 60)

  res.minutes = time % 60
  time = ~~(time / 60)

  res.hours = time % 60

  return `${res.hours}H ${res.minutes}M ${res.seconds}S`
}

exports.handler = (client, msg, args, guildState, env, modules) => {
  const ms = modules.messageSender
  const pf = env.prefix

  if (!args.length) return ms.error(`Usage: **${pf}timer <add | list | remove>**`, msg.channel)
  const base = args[0].toUpperCase()

  if (base === 'ADD') {
    if (args.length <= 3) return ms.error(`Invalid usage: **${pf}timer add <name> <duration (seconds)> <description>**`, msg.channel)
    if (args[1] in guildState.timers) return ms.error(`A timer with the name ${args[1]} already exists! Please choose another name.`, msg.channel)

    const description = args.slice(3).join(' ')

    guildState.timers[args[1]] = {
      name: args[1],
      description: description,
      originalTime: Date.now(),
      duration: parseInt(args[2]) * 1000,
      timer: setTimeout(() => { ms.info(`${msg.member.toString()}: ${description}`, msg.channel) }, parseInt(args[2]) * 1000)
    }

    ms.info('Timer added!', msg.channel)
  } else if (base === 'LIST') {
    if (args.length !== 1) return ms.error(`Invalid usage: **${pf}timer <list>**`)

    let res = `No timers found. Create one: **${pf}timer add <name> <duration (seconds)> <description>**`
    if (!_.isEmpty(guildState.timers)) {
      res = '**Timers: **\n```'
      _.values(guildState.timers).forEach((e) => {
        res += `[${formatMiliseconds(e.duration - (Date.now() - e.originalTime))}] ${e.name} - ${e.description}\n`
      })
      res += '```'
    }

    ms.info(res, msg.channel)
  } else if (base === 'REMOVE') {
    if (args.length > 2) return ms.error(`Invalid usage: **${pf}timer remove <name>**`)

    let timer = guildState.timers[args[1]]
    if (args[1] in guildState.timers) {
      clearTimeout(timer.timer)
      delete guildState.timers[args[1]]
      ms.info(`Timer **${args[1]}** has been removed`, msg.channel)
    } else ms.error(`Timer **${args[1]} does not exist`)
  } else ms.error('Invalid operation. Valid operations: **ADD, LIST, REMOVE**', msg.channel)
}

exports.info = {
  command: 'timer',
  fullCommand: 'timer <add | list | remove>',
  shortDescription: '',
  longDescription: ''
}
