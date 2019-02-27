/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

import { before, describe, it } from 'mocha'
import { configure, BaseAe, execute, parseBlock, ready } from './index'
import { generateKeyPair } from '@aeternity/aepp-sdk/es/utils/crypto'

describe('CLI Chain Module', function () {
  let wallet
  configure(this)

  before(async function () {
    // Spend tokens for wallet
    wallet = await ready(this)
  })
  it('TOP', async () => {
    const res = parseBlock(await execute(['chain', 'top']))
    res.should.be.a('object')
    res.block_hash.should.be.a('string')
    parseInt(res.block_height).should.be.a('number')
  })
  it('STATUS', async () => {
    let wallet = await BaseAe()
    wallet.setKeypair(generateKeyPair())

    const { nodeVersion } = await wallet.api.getStatus()
    const res = parseBlock(await execute(['chain', 'status']))

    res['node_version'].should.equal(nodeVersion)
  })
  it('PLAY', async () => {
    const res = await execute(['chain', 'play', '--limit', '4'])
    res.split('<<------------------------------------->>').length.should.equal(5)

    const parsed = res.split('<<------------------------------------->>').map(parseBlock)
    parsed[0].previous_block_hash.should.equal(parsed[1].block_hash)
    parsed[1].previous_block_hash.should.equal(parsed[2].block_hash)
    parsed[2].previous_block_hash.should.equal(parsed[3].block_hash)
  })
  it('TTL', async () => {
    const [res, height] = await Promise.all([
      execute(['chain', 'ttl', 10]),
      wallet.height()
    ])
    const {relative_ttl} = parseBlock(res)
    parseInt(height).should.equal(+relative_ttl - 10)
  })
  it('NETWORK ID', async () => {
    const nodeNetworkId = wallet.nodeNetworkId
    const { network_id } = parseBlock(await execute(['chain', 'network_id']))
    nodeNetworkId.should.equal(network_id)
  })
})
