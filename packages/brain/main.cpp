#include <iostream>
#include <string>

int main(){
    std::string npc_id;
    std::string message;

    std::getline(std::cin, npc_id);
    std::getline(std::cin, message);

    if (npc_id.empty() || message.empty()){
        std::cout << "No message received.";
        return 0;
    }

    std::cout << "Tavern Brain (" << npc_id << ") received: " << message << std::endl;
}