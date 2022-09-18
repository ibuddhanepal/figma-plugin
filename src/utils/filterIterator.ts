export function filterIterator<V>(
  it: Iterator<V>,
  fn: (result: IteratorResult<V, V>) => boolean,
) {
  const filtered: V[] = [];
  let result = it.next();
  do {
    if (fn(result)) {
      filtered.push(result.value);
    }
    result = it.next();
  } while (!result.done);
  return filtered;
}
