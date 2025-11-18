const mockOn = jest.fn()
const mockGet = jest.fn(() => ({
        on: mockOn,
}))
const mockClientConstructor = jest.fn(() => ({
        get: mockGet,
}))

jest.mock('node-rest-client', () => ({
        Client: mockClientConstructor,
        __mockGet: mockGet,
        __mockOn: mockOn,
}))

const api = require('../src/api')
const { Client, __mockGet, __mockOn } = require('node-rest-client')

describe('api interval helpers', () => {
        beforeEach(() => {
                jest.useFakeTimers()
        })

        afterEach(() => {
                jest.useRealTimers()
                jest.clearAllTimers()
        })

        test('setupInterval starts polling when enabled', () => {
                const setIntervalSpy = jest.spyOn(global, 'setInterval')
                const context = {
                        config: { polling: true, polling_rate: 250 },
                        getState: jest.fn(),
                        log: jest.fn(),
                        INTERVAL: null,
                        stopInterval: api.stopInterval,
                }

                api.setupInterval.call(context)

                expect(setIntervalSpy).toHaveBeenCalledTimes(1)
                const [intervalCallback, intervalRate] = setIntervalSpy.mock.calls[0]
                expect(intervalRate).toBe(250)

                intervalCallback()
                expect(context.getState).toHaveBeenCalledTimes(1)
                expect(context.log).toHaveBeenCalledWith('info', 'Starting Update Interval.')
                setIntervalSpy.mockRestore()
        })

        test('setupInterval does not start polling when disabled', () => {
                const setIntervalSpy = jest.spyOn(global, 'setInterval')
                const context = {
                        config: { polling: false, polling_rate: 250 },
                        log: jest.fn(),
                        INTERVAL: null,
                        stopInterval: api.stopInterval,
                }

                api.setupInterval.call(context)

                expect(setIntervalSpy).not.toHaveBeenCalled()
                expect(context.log).not.toHaveBeenCalled()
                setIntervalSpy.mockRestore()
        })

        test('stopInterval clears an active timer', () => {
                const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
                const context = {
                        INTERVAL: 1234,
                        log: jest.fn(),
                }

                api.stopInterval.call(context)

                expect(clearIntervalSpy).toHaveBeenCalledWith(1234)
                expect(context.INTERVAL).toBeNull()
                expect(context.log).toHaveBeenCalledWith('info', 'Stopping Update Interval.')
                clearIntervalSpy.mockRestore()
        })
})

describe('runCommand', () => {
        beforeEach(() => {
                Client.mockClear()
                __mockGet.mockClear()
                __mockOn.mockClear()
        })

        test('sends http requests with verbose logging', () => {
                const context = {
                        config: { protocol: 'http', host: '10.0.0.5', verbose: true },
                        log: jest.fn(),
                        updateStatus: jest.fn(),
                        stopPolling: jest.fn(),
                }

                api.runCommand.call(context, 'Cue 1')

                expect(context.log).toHaveBeenCalledWith('debug', 'Sending command: Cue 1')
                expect(Client).toHaveBeenCalledTimes(1)
                expect(__mockGet).toHaveBeenCalledWith('http://10.0.0.5:80/exe.cgi?cmd=Cue 1', expect.any(Function))
                expect(__mockOn).toHaveBeenCalledWith('error', expect.any(Function))
        })

        test('sends UDP commands when udp transport is active', () => {
                const send = jest.fn()
                const context = {
                        config: { protocol: 'udp', verbose: false },
                        udp: { send },
                        log: jest.fn(),
                }

                api.runCommand.call(context, 'Macro 7')

                expect(send).toHaveBeenCalledWith('Macro 7')
                expect(Client).not.toHaveBeenCalled()
        })

        test('ignores missing command payloads', () => {
                const context = {
                        config: { protocol: 'http', host: '10.0.0.10', verbose: false },
                        log: jest.fn(),
                        updateStatus: jest.fn(),
                        stopPolling: jest.fn(),
                }

                api.runCommand.call(context)

                expect(Client).not.toHaveBeenCalled()
                expect(context.log).not.toHaveBeenCalled()
        })
})
