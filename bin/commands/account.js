#!/usr/bin/env node
// # æternity CLI `account` file
//
// This script initialize all `account` function
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

import { generateSecureWallet, generateSecureWalletFromPrivKey } from '../utils/account'
import { HASH_TYPES } from '../utils/constant'
import { initClientByWalletFile } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { print, printError, printTransaction, printUnderscored } from '../utils/print'
import { checkPref } from '../utils/helpers'
import { PROMPT_TYPE, prompt } from '../utils/prompt'

// ## `Sign` function
// this function allow you to `sign` transaction's
async function sign (walletPath, tx, options) {
  let { json } = options
  try {
    // Validate `tx` hash
    if (tx.slice(0, 2) !== 'tx') { throw new Error('Invalid transaction hash') }

    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Account` flavor with this `keyPair`
    const client = await initClientByWalletFile(walletPath, { ...options, accountOnly: true })

    await handleApiError(async () => {
      const signedTx = await client.signTransaction(tx)
      if (json) {
        print({ signedTx })
      } else {
        printUnderscored('Signing account address', await client.address())
        printUnderscored('Network ID', client.networkId || client.nodeNetworkId || 'ae_mainnet') // TODO add getNetworkId function to SDK
        printUnderscored('Unsigned', tx)
        printUnderscored('Signed', signedTx)
      }
    })
  } catch (e) {
    printError(e.message)
  }
}

// ## `Spend` function
// this function allow you to `send` token's to another `account`
async function spend (walletPath, receiver, amount, options) {
  let { ttl, json, nonce, payload, fee } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  try {
    checkPref(receiver, HASH_TYPES.account)
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      let tx = await client.spend(amount, receiver, { ttl, nonce, payload, fee })
      // if waitMined false
      if (typeof tx !== 'object') {
        tx = await client.tx(tx)
      } else {
        print('Transaction mined')
      }
      printTransaction(tx, json)
    })
  } catch (e) {
    printError(e.message)
  }
}

// ## Get `balance` function
// This function allow you retrieve account `balance`
async function getBalance (walletPath, options) {
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const { client, keypair } = await initClientByWalletFile(walletPath, options, true)
    await handleApiError(
      async () => {
        const nonce = await client.getAccountNonce(keypair.publicKey)
        printUnderscored('Balance', await client.balance(keypair.publicKey))
        printUnderscored('ID', await client.address())
        printUnderscored('Nonce', nonce)
      }
    )
  } catch (e) {
    printError(e.message)
  }
}

// ## Get `address` function
// This function allow you retrieve account `public` and `private` keys
async function getAddress (walletPath, options) {
  const { privateKey, forcePrompt = false } = options
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const { client, keypair } = await initClientByWalletFile(walletPath, options, true)

    await handleApiError(
      async () => {
        printUnderscored('Address', await client.address())
        if (privateKey) {
          if (forcePrompt || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' })) {
            printUnderscored('Secret Key', keypair.secretKey)
          }
        }
      }
    )
  } catch (e) {
    printError(e.message)
  }
}

// ## Get `nonce` function
// This function allow you retrieve account `nonce`
async function getAccountNonce (walletPath, options) {
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const { client, keypair } = await initClientByWalletFile(walletPath, options, true)

    await handleApiError(
      async () => {
        const nonce = await client.getAccountNonce(keypair.publicKey)
        printUnderscored('ID', keypair.publicKey)
        printUnderscored('Nonce', nonce)
      }
    )
  } catch (e) {
    printError(e.message)
  }
}

// ## Create secure `wallet` file
// This function allow you to generate `keypair` and write it to secure `ethereum` like key-file
async function createSecureWallet (walletPath, { output, password, overwrite }) {
  try {
    await generateSecureWallet(walletPath, { output, password, overwrite })
    process.exit(1)
  } catch (e) {
    printError(e.message)
  }
}

// ## Create secure `wallet` file from `private-key`
// This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file
async function createSecureWalletByPrivKey (walletPath, priv, { output, password, overwrite }) {
  try {
    await generateSecureWalletFromPrivKey(walletPath, priv, { output, password, overwrite })
    process.exit(1)
  } catch (e) {
    printError(e.message)
  }
}

export const Account = {
  spend,
  getBalance,
  getAddress,
  getAccountNonce,
  createSecureWallet,
  createSecureWalletByPrivKey,
  sign
}
