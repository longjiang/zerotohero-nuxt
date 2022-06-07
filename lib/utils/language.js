export const l1Code = (l2Code) => {
  let l1 = "en";
  let special = SPECIAL_LANGUAGES[l2Code];
  if (special) l1 = special.l1;
  return l1
}