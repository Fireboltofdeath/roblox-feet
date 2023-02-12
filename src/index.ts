#!/usr/bin/env node

import { createRootCommand } from "./definitions";

createRootCommand().parse(process.argv);
