const actions = require('../src/actions')

describe('actions', () => {
        test('registers all expected definitions', () => {
                const context = {
                        runCommand: jest.fn(),
                        setActionDefinitions: jest.fn(),
                }

                actions.initActions.call(context)

                expect(context.setActionDefinitions).toHaveBeenCalledTimes(1)
                const definitions = context.setActionDefinitions.mock.calls[0][0]

                expect(Object.keys(definitions)).toEqual([
                        'cuescript',
                        'audio',
                        'audiostop',
                        'cue',
                        'macro',
                        'playback',
                        'reboot',
                ])
        })

        test('callbacks pass the correct command to runCommand', async () => {
                const runCommand = jest.fn()
                const context = {
                        runCommand,
                        setActionDefinitions: jest.fn(),
                }

                actions.initActions.call(context)
                const definitions = context.setActionDefinitions.mock.calls[0][0]

                await definitions.cuescript.callback({ options: { script: 'Custom 1' } })
                await definitions.audio.callback({ options: { audiofile: 'Intro.wav' } })
                await definitions.audiostop.callback({ options: {} })
                await definitions.cue.callback({ options: { cuenumber: '5' } })
                await definitions.macro.callback({ options: { macronumber: '7' } })
                await definitions.playback.callback({ options: { playbacknumber: '3' } })
                await definitions.reboot.callback({ options: {} })

                expect(runCommand.mock.calls).toEqual([
                        ['Custom 1'],
                        ['Audio Intro.wav'],
                        ['Audio Stop'],
                        ['Cue 5'],
                        ['Macro 7'],
                        ['Playback 3'],
                        ['Reboot'],
                ])
        })
})
