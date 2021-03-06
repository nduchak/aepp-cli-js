#!/usr/bin/env node
// # æternity CLI `root` file
//
// This script initialize all `cli` commands
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
'use strict'
// We'll use `commander` for parsing options
// Also we need `esm` package to handle `ES imports`
const program = require('commander')

require = require('esm')(module/*, options */) // use to handle es6 import/export
const utils = require('./utils/index')

// Array of child command's
const EXECUTABLE_CMD = [
  { name: 'chain', desc: 'Interact with the blockchain' },
  { name: 'inspect', desc: 'Get information on transactions, blocks,...' },
  { name: 'account', desc: 'Handle wallet operations' },
  { name: 'contract', desc: 'Compile contracts' },
  { name: 'name', desc: 'AENS system' },
  { name: 'tx', desc: 'Transaction builder' },
  /* TODO implement oracle module
  * {name: 'oracle', desc: 'Interact with oracles'},
  */
  { name: 'crypto', desc: 'Crypto helpers' }
]
// ##Get version from `package.json`
//
// You get get CLI version by exec `aecli version`
program
  .version(require('../package.json').version)

// ## Initialize `config` command
program
  .command('config')
  .description('Print the client configuration')
  .action((cmd) => utils.print.printConfig(cmd))

// ## Initialize `child` command's
utils.cli.initExecCommands(program)(EXECUTABLE_CMD)

// Handle unknown command's
program.on('command:*', () => utils.errors.unknownCommandHandler(program)(EXECUTABLE_CMD))

// Parse arguments or show `help` if argument's is empty
program.parse(process.argv)
if (program.args.length === 0) program.help()
