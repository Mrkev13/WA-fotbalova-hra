# Data Model Documentation

This document describes the database structure for Pixel Football Tycoon.

## SQL Tables

### `users`
- Stores user account information, club metadata, and global progress (money, level, xp).
- **Start Capital**: 1000 coins.
- **Experience (xp)**: Starts at 0, goes up after matches. Reaching thresholds increases `level`.

### `players`
- Stores individual football players.
- Each player belongs to a user (`user_id`).
- Stats: `attack` and `defense` range from 10 to 50.
- `market_value` is calculated as `(attack + defense) * 10`.

### `matches`
- Logs the results of matches between users.

## Relationships
- **User 1:N Players**: One user owns many players (a squad).
- **User 1:N Matches**: One user can participate in many matches (both as home and away).
