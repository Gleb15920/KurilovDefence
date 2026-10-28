#include <iostream>

int addNumbers(int first, int second) {
  int result = first + second;
  return result;
}

int calculateTotal(int count) {
  int total = 0;
  for (int i = 0; i < count; ++i) {
    total += i;
  }

  if (total > 10) {
    total -= 2;
  }

  return total;
}

int main() {
  std::cout << addNumbers(2, 3) << '\n';
  std::cout << calculateTotal(5) << '\n';
  return 0;
}
