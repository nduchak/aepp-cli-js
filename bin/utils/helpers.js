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
// # Utils `helpers` Module
// That script contains base helper function

import * as R from 'ramda'
import fs from 'fs'

import { HASH_TYPES } from './constant'
import { printError } from './print'
import path from 'path'

// ## Method which retrieve block info by hash
// if it's `MICRO_BLOCK` call `getMicroBlockHeaderByHash` and `getMicroBlockTransactionsByHash`
//
// if it's `BLOCK` call `getKeyBlockByHash`
export function getBlock (hash) {
  return async (client) => {
    if (hash.indexOf(HASH_TYPES.block + '_') !== -1) {
      return client.api.getKeyBlockByHash(hash)
    }
    if (hash.indexOf(HASH_TYPES.micro_block + '_') !== -1) {
      return R.merge(
        await client.api.getMicroBlockHeaderByHash(hash),
        await client.api.getMicroBlockTransactionsByHash(hash)
      )
    }
  }
}

// ## Method which validate `hash`
export function checkPref (hash, hashType) {
  if (hash.length < 3 || hash.indexOf('_') === -1) {
    throw new Error(`Invalid input, likely you forgot to escape the $ sign (use \\_)`)
  }

  /* block and micro block check */
  if (Array.isArray(hashType)) {
    const res = hashType.find(ht => hash.slice(0, 3) === ht + '_')
    if (res) { return res }
    throw new Error('Invalid block hash, it should be like: mh_.... or kh._...')
  }

  if (hash.slice(0, 3) !== hashType + '_') {
    let msg
    switch (hashType) {
      case HASH_TYPES.transaction:
        msg = 'Invalid transaction hash, it should be like: th_....'
        break
      case HASH_TYPES.account:
        msg = 'Invalid account address, it should be like: ak_....'
        break
    }
    throw new Error(msg)
  }
}

// ## FILE I/O

// Read JSON file
export function readJSONFile (filePath) {
  try {
    return JSON.parse(readFile(filePath))
  } catch (e) {
    printError('READ FILE ERROR:')
    printError('  message: ' + e.message)
    printError('  path: ' + filePath)
    process.exit(1)
  }
}

// Write file to filesystem
export function writeFile (name, data, errTitle = 'WRITE FILE ERROR') {
  try {
    fs.writeFileSync(
      name,
      data
    )
    return true
  } catch (e) {
    printError(`${errTitle}: ` + e)
    process.exit(1)
  }
}

// Read file from filesystem
export function readFile (path, encoding = null, errTitle = 'READ FILE ERR') {
  try {
    return fs.readFileSync(
      path,
      encoding
    )
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
        throw new Error('File not found')
      default:
        throw e
    }
  }
}

// Is file exist
export function isFileExist (path) {
  return fs.existsSync(path)
}

// ## AENS helpers methods

// Get `name` status
export function updateNameStatus (name) {
  return async (client) => {
    try {
      return await client.api.getNameEntryByName(name)
    } catch (e) {
      if (e.response && e.response.status === 404) {
        return { name, status: 'AVAILABLE' }
      }
      throw e
    }
  }
}

// Check if `name` is `AVAILABLE`
export function isAvailable (name) { return name.status === 'AVAILABLE' }

// Validate `name`
export function validateName (name) {
  if (R.last(name.split('.')) !== 'test') { throw new Error('AENS TLDs must end in .test') }
}

// Grab contract descriptor by path
export const grabDesc = async descrPath => descrPath && readJSONFile(path.resolve(process.cwd(), descrPath))
