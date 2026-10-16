import type { ButtonHandler, Command } from '../types.js';
import { pollButtons } from '../interactions/poll-buttons.js';
import { ajuda } from './ajuda.js';
import { enquete } from './enquete.js';
import { lembrete } from './lembrete.js';
import { ping } from './ping.js';

export const commands: Command[] = [lembrete, enquete, ping, ajuda];
export const buttonHandlers: ButtonHandler[] = [pollButtons];
