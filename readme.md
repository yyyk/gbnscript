# gbnscript

is a domain-specific language for Grid By Numbers.

## examples

### 1 (blank canvas)

```
size width 600 height 600
end
```

### 2 (a square)

```
size width 600 height 600
  rectangle
    width 200 height 200
    positionX 0 positionY 0
  end
end
```

## syntax

### comments

```
// comment
```

### numbers

```
// int
1

// float
1.1
```

### arithmetic operations

```
// add
1 + 1
-1 + 1

// subtract
1 - 1

// multiply
1 * 2

// divide
1 / 2

// modulo
6 % 2

// exponent
2 ** 3

// precedence of operators
1 + 2 * 3 // => 7
(1 + 2) * 3 // => 9
```

### boolean expression

```
true

false
```

### variable declaration

```
set a 1
set a 1 + 1 // => a = 2
set a true
set a false
```

### variable assign

```
update a 2
update a 2 + 2 // => a = 4
update a false
update a true
```

### comparator

```
not a

a == b
a != b

a > b
a >= b

a < b
a <= b

a and b
a or b
```

### semicolon

Below would be interpreted as `set a 1 - a`.

```
set a 1
-a
```

To avoid it, semicolons can be used.  
In the case below, `set a 1` is first executed and `-a` would be interpreted as `-1`.

```
set a 1;
-a
```

### reserved words

```
true
false

not

and
or

set
update

end

if
then
elsif
else

repeat
from
to
do

size

group
rectangle

width
height

positionX
positionY

rotate

scale
scaleX
scaleY
```

### if-elsif-else conditionals

if:

```
if condition1 then statement1 end

if condition1 then
  statement1
  statement2
end
```

if + else:

```
if condition1 then
  statement1
  statement2
else
  statement3
end
```

if + elsif (+ elsif...) + else:

```
if condition1 then
  statement1
  statement2
elsif condition2 then
  statement3
  statement4
else
  statement5
end
```

### repeat

```
repeat i from 0 to 10 do
end
```

### size

arguments: `width`, `height`

```
size width 600 height 600
end
```

### group

arguments: `positionX`, `positionY`, `rotate`, `scale`, `scaleX`, `scaleY`

```
group

end

```

### rectangle

arguments: `width`, `height`, `positionX`, `positionY`, `rotate`, `scale`, `scaleX`, `scaleY`

```
rectangle
  width 200 height 200
  positionX 0 positionY 0
end
```

### TODO:
  - put all the error messages in `error.ts`
  - setting color
  - step option for `repeat`
  - print function for logging purpose
  - maths functions `floor`, `ceil`, `round` as prefix expression
  - string literal
