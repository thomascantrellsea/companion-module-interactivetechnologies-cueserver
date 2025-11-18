const { Regex } = require('@companion-module/base')
const config = require('../src/config')

describe('config fields', () => {
        test('includes expected ids and order', () => {
                const fields = config.getConfigFields()

                expect(Array.isArray(fields)).toBe(true)
                expect(fields).toHaveLength(5)
                expect(fields.map((field) => field.id)).toEqual([
                        'info',
                        'host',
                        'protocol',
                        'info2',
                        'verbose',
                ])
        })

        test('host field enforces IP addresses', () => {
                const fields = config.getConfigFields()
                const hostField = fields.find((field) => field.id === 'host')

                expect(hostField.regex).toBe(Regex.IP)
                expect(hostField.label).toBe('Target IP')
        })

        test('protocol field defaults to http and exposes both options', () => {
                const fields = config.getConfigFields()
                const protocolField = fields.find((field) => field.id === 'protocol')

                expect(protocolField.default).toBe('http')
                expect(protocolField.choices).toEqual([
                        { id: 'http', label: 'HTTP (Port 80)' },
                        { id: 'udp', label: 'UDP (Port 52737)' },
                ])
        })
})
