# Japanese verb conjugation and unconjugation

Deconjugation? conconjugation? Anyway, this module lets you
generate verb conjugation lists, as well as try to unconjugate
a vern form to its original verb.

## Installation

`npm install jp-conjugation`

## Use

`var verbs = require('jp-conjugation');`

## API

> .conjugate(verb, verbtype) -> array

generate the verb conjugations. If the verb is ambiguously
ichidan or nidan, adding verbtype "v1" will force conjugation
as an ichidan verb.

> .unconjugate(verb)

Try to find the original form of a verb, and the names
for the (series of) conjugations of the passed verb form.
