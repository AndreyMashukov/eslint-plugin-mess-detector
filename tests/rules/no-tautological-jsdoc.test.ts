import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import { noTautologicalJSDoc } from "../../src/rules/no-tautological-jsdoc.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run("no-tautological-jsdoc", noTautologicalJSDoc, {
  valid: [
    {
      code: "/** Adds two numbers clipped to int range; overflow wraps silently. */\nexport function add(a: number, b: number): number { return a + b; }",
    },
    {
      code: "export function add(a: number, b: number): number { return a + b; }",
    },
    {
      code: "/** Some unrelated prose about timezones. */\nexport function add(a: number, b: number): number { return a + b; }",
    },
    {
      code: "/** Computes the SHA-256 of `input` and returns a 32-byte Buffer. */\nexport function hash(input: string): Buffer { return Buffer.from(input); }",
    },
    {
      code: "function privateHelper() { return 1; }",
    },
    {
      code: "/** add adds two numbers and returns a Result containing them. */\nfunction add(a: number, b: number) { return a + b; }",
    },
  ],
  invalid: [
    {
      code: "/** Add adds two numbers. */\nexport function add(a: number, b: number) { return a + b; }",
      errors: [
        { messageId: "tautologicalJSDoc", data: { name: "add" } },
      ],
    },
    {
      code: "/** GetUser returns the user. */\nexport function getUser() { return {}; }",
      errors: [
        { messageId: "tautologicalJSDoc", data: { name: "getUser" } },
      ],
    },
    {
      code: "/** ParseDate parses a date. */\nexport function parseDate() { return new Date(); }",
      errors: [
        { messageId: "tautologicalJSDoc", data: { name: "parseDate" } },
      ],
    },
    {
      code: "/** Sum returns the sum. */\nexport const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);",
      errors: [
        { messageId: "tautologicalJSDoc", data: { name: "sum" } },
      ],
    },
    {
      code: "/** newClient creates a new Client. */\nexport function newClient() { return {}; }",
      errors: [
        { messageId: "tautologicalJSDoc", data: { name: "newClient" } },
      ],
    },
    {
      code: "/** handle handles the request. */\nexport default function handle() { return {}; }",
      errors: [
        { messageId: "tautologicalJSDoc", data: { name: "handle" } },
      ],
    },
    {
      code: "/** Encode encodes the input. */\nexport function encode(input: string) { return input; }",
      errors: [
        { messageId: "tautologicalJSDoc", data: { name: "encode" } },
      ],
    },
  ],
});
