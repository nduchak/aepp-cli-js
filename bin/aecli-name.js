#!/usr/bin/env node
// # æternity CLI `name` file
//
// This script initialize all `name` commands
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
// We'll use `commander` for parsing options
//
// Also we need `esm` package to handle `ES imports`
const program = require('commander')

require = require('esm')(module/*, options*/) //use to handle es6 import/export
const utils = require('./utils/index')
const { AENS } = require('./commands')

// ## Initialize `options`
program
  .option('-u, --url [hostname]', 'Node to connect to', utils.constant.EPOCH_URL)
  .option('-U, --internalUrl [internal]', 'Node to connect to(internal)', utils.constant.EPOCH_INTERNAL_URL)
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('--native', 'Build transaction natively')
  .option('-P, --password [password]', 'Wallet Password')
  .option('-N, --nameTtl [nameTtl]', 'Name life Ttl', utils.constant.NAME_TTL)
  .option('-T, --ttl [ttl]', 'Life Ttl', utils.constant.TX_TTL)
  .option('-f --force', 'Ignore node version compatibility check')
  .option('-n, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .option('--json', 'Print result in json format')

// ## Initialize `claim` command
//
// You can use this command to `claim` AENS name. Name must end on `.test`.
//
// Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.test`
//
// This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's
//
// You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`
program
  .command('claim <wallet_path> <name>')
  .description('Claim a domain name')
  .action(async (walletPath, name, ...arguments) => await AENS.claim(walletPath, name, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `revoke` command
//
// You can use this command to `destroy` AENS name.
//
// Example: `aecli name revoke ./myWalletKeyFile --password testpass testname.test`
program
  .command('revoke  <wallet_path> <name>')
  .description('Revoke a domain name')
  .action(async (walletPath, name, ...arguments) => await AENS.revokeName(walletPath, name, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `transfer` command
//
// You can use this command to `transfer` AENS name to another account.
//
// Example: `aecli name transfer ./myWalletKeyFile --password testpass testname.test ak_qqwemjgflewgkj349gjdslksd`
program
  .command('transfer <wallet_path> <name> <address>')
  .description('Transfer a name to another account')
  .action(async (walletPath, name, address, ...arguments) => await AENS.transferName(walletPath, name, address, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `claim` command
//
// You can use this command to `update` pointer of AENS name.
//
// Example: `aecli name update ./myWalletKeyFile --password testpass testname.test ak_qwe23dffasfgdesag323`
program
  .command('update <wallet_path> <name> <address>')
  .description('Update a name pointer')
  .action(async (walletPath, name, address, ...arguments) => await AENS.updateName(walletPath, name, address, utils.cli.getCmdFromArguments(arguments)))

// Handle unknown command's
program.on('command:*', () => utils.errors.unknownCommandHandler(program)())

// Parse arguments or show `help` if argument's is empty
program.parse(process.argv)
if (program.args.length === 0) program.help()
