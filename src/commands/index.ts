import type { ButtonHandler, Command } from '../types.js';
import { ajuda } from './ajuda.js';
import { lembrete } from './lembrete.js';
import { ping } from './ping.js';

export const commands: Command[] = [lembrete, ping, ajuda];
export const buttonHandlers: ButtonHandler[] = [];
