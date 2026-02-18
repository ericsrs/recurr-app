/*******************************************************
 * runMacro.cpp
 * -----------------------------------------------------
 * This script 
********************************************************/

#include <iostream>
#include <fstream>
#include <vector>

#include "json.hpp" // nhlomann

using json = nlohmann::json;

struct KeyEvent 
{
    int vkCode;
    int keyDown; // Temp int for testing purposes
    int timestamp;
};

int main() 
{
    std::cerr << "Begin runMacro.exe..." << std::endl;

    std::ifstream file("src/macros/macro.json");

    json j;
    file >> j;

    std::vector<KeyEvent> events;

    for (const auto& e : j) {
        events.push_back({ e["vkCode"], e["keyDown"], e["timestamp"] });
    }

    for (int i = 0; i < events.size(); ++i)
    {
        std::cerr << events[i].vkCode << std::endl;
    }

    return 0;
}