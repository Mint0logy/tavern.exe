#include <iostream>
#include <string>

int main(){
    std::string message;

    std::getline(std::cin, message);

    if (message.empty()){
        std::cout << "No message received.";
        return 0;
    }

    std::cout << "Tavern Brain received: " << message << std::endl;
}