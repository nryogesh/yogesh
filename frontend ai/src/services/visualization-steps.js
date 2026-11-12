function createFrame(array, activeIndices, sortedIndices, message, resultIndices = []) {
  return {
    array: [...array],
    activeIndices: [...activeIndices],
    sortedIndices: [...new Set(sortedIndices)].sort((left, right) => left - right),
    resultIndices: [...resultIndices],
    message,
  }
}

export function parseIntegerArray(input) {
  const values = input.split(',').map((value) => value.trim())
  if (!values.length || values.some((value) => value === '')) {
    throw new Error('Enter comma-separated whole numbers.')
  }

  const parsed = values.map(Number)
  if (parsed.length > 20 || parsed.some((value) => !Number.isSafeInteger(value))) {
    throw new Error('Use between 1 and 20 safe whole numbers.')
  }

  return parsed
}

export function createVisualizationSteps(algorithm, input, targetValue) {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20 ||
    input.some((value) => !Number.isSafeInteger(value))) {
    throw new Error('Provide between 1 and 20 whole numbers.')
  }

  const values = [...input]
  const frames = [createFrame(values, [], [], 'Starting values. Choose Next step to trace the algorithm.')]

  if (algorithm === 'linear-search' || algorithm === 'binary-search') {
    const target = Number(targetValue)
    if (String(targetValue).trim() === '' || !Number.isSafeInteger(target)) throw new Error('Enter a whole-number search target.')
    if (algorithm === 'binary-search' && values.some((value, index) => index > 0 && value < values[index - 1])) {
      throw new Error('Binary search needs values sorted in ascending order.')
    }

    if (algorithm === 'linear-search') {
      for (let index = 0; index < values.length; index += 1) {
        frames.push(createFrame(values, [index], [], `Compare index ${index}: ${values[index]} ${values[index] === target ? 'matches' : 'does not match'} target ${target}.`, values[index] === target ? [index] : []))
        if (values[index] === target) break
      }
    } else {
      let left = 0
      let right = values.length - 1
      while (left <= right) {
        const middle = Math.floor(left + (right - left) / 2)
        const value = values[middle]
        frames.push(createFrame(values, [middle], [], `Check middle index ${middle}: ${value} ${value === target ? 'matches' : value < target ? 'is below' : 'is above'} target ${target}.`, value === target ? [middle] : []))
        if (value === target) break

        if (value < target) left = middle + 1
        else right = middle - 1
        frames.push(createFrame(values, left <= right ? [left, right] : [], [], left <= right
          ? `Discard the values outside indices ${left}–${right}.`
          : `The remaining range is empty; ${target} is not present.`))
      }
    }

    const foundIndex = values.indexOf(target)
    frames.push(createFrame(values, foundIndex === -1 ? [] : [foundIndex], [], foundIndex === -1
      ? `${target} was not found.`
      : `Search complete: ${target} is at index ${foundIndex}.`, foundIndex === -1 ? [] : [foundIndex]))
    return frames
  }

  if (algorithm === 'bubble-sort') {
    const sorted = new Set()
    for (let end = values.length - 1; end > 0; end -= 1) {
      for (let index = 0; index < end; index += 1) {
        frames.push(createFrame(values, [index, index + 1], sorted, `Compare ${values[index]} and ${values[index + 1]}.`))
        if (values[index] > values[index + 1]) {
          ;[values[index], values[index + 1]] = [values[index + 1], values[index]]
          frames.push(createFrame(values, [index, index + 1], sorted, `Swap them: ${values[index]} now comes before ${values[index + 1]}.`))
        }
      }
      sorted.add(end)
      frames.push(createFrame(values, [], sorted, `The largest remaining value is in its final position at index ${end}.`))
    }
    if (values.length > 0) sorted.add(0)
    frames.push(createFrame(values, [], sorted, 'Bubble sort complete. Values are in ascending order.'))
    return frames
  }

  if (algorithm === 'insertion-sort') {
    for (let index = 1; index < values.length; index += 1) {
      const current = values[index]
      let previous = index - 1
      frames.push(createFrame(values, [index], [], `Take ${current} from index ${index} and insert it into the sorted left portion.`))
      while (previous >= 0 && values[previous] > current) {
        frames.push(createFrame(values, [previous, previous + 1], [], `Move ${values[previous]} one place right because it is greater than ${current}.`))
        values[previous + 1] = values[previous]
        previous -= 1
      }
      values[previous + 1] = current
      frames.push(createFrame(values, [previous + 1], [], `Insert ${current} at index ${previous + 1}.`))
    }
    frames.push(createFrame(values, [], values.map((_value, index) => index), 'Insertion sort complete. Values are in ascending order.'))
    return frames
  }

  throw new Error('Choose a supported search or sorting algorithm.')
}
