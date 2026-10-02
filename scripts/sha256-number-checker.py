#!/usr/bin/env python3
"""Find numbers whose decimal text has a specified SHA-256 hash."""

from __future__ import annotations

import argparse
import hashlib


DEFAULT_TARGET = "9d157009fc19a7bdc17f5b684bc96d5bbb53580755092f255a97d75b0bcbf0e1"


def find_matches(start: int, end: int, target: str) -> list[int]:
    """Return numbers in the inclusive range that have the target hash."""
    return [
        number
        for number in range(start, end + 1)
        if hashlib.sha256(str(number).encode("utf-8")).hexdigest() == target
    ]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Hash the decimal text of each number in an inclusive range."
    )
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--end", type=int, default=100)
    parser.add_argument("--target", default=DEFAULT_TARGET.lower())
    args = parser.parse_args()

    if args.start > args.end:
        parser.error("--start must be less than or equal to --end")

    target = args.target.lower()
    if len(target) != 64 or any(character not in "0123456789abcdef" for character in target):
        parser.error("--target must be a 64-character hexadecimal SHA-256 hash")

    matches = find_matches(args.start, args.end, target)
    if matches:
        for number in matches:
            print(f"Match found: {number}")
    else:
        print(f"No match found from {args.start} through {args.end}.")


if __name__ == "__main__":
    main()
