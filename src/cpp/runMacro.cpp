/*******************************************************
 * runMacro.cpp
 * -----------------------------------------------------
 * This script 
********************************************************/

#include <Windows.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <string>

#include "json.hpp" // nhlomann

using json = nlohmann::json;

struct KeyEvent 
{
    int vkCode;
    int keyDown; // Temp int for testing purposes
    int timestamp;
};


/****************** PROTOTYPES ******************/
void playMacro(const std::vector<KeyEvent>& events);
void sendKey(int vkCode, bool keyDown);
/************************************************/


int main(int argc, char* argv[]) 
{
    std::cerr << "Begin runMacro.exe..." << std::endl;

    Sleep(3000);


    const std::string macroPath = argv[1];

    std::cerr << "Opening file: " << macroPath << std::endl;
    std::ifstream file(macroPath);

    if (!file.is_open()) {
        std::cerr << "Failed to open file: " << macroPath << std::endl;
        return 1;
    }

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

    for (int i = 0; i < argc; ++i) {
        std::cerr << "argv[" << i << "]: " << argv[i] << std::endl;
    }

    playMacro(events);


    return 0;
}


void playMacro(const std::vector<KeyEvent>& events)
{
    for (auto& e : events)
    {
        sendKey(e.vkCode, true);
        Sleep(50);
        sendKey(e.vkCode, false);
        Sleep(50);
    }
}


void sendKey(int vkCode, bool keyDown)
{
    INPUT input = {};
    input.type = INPUT_KEYBOARD;
    input.ki.wVk = vkCode;

    if (!keyDown)
        input.ki.dwFlags = KEYEVENTF_KEYUP;

    SendInput(1, &input, sizeof(INPUT));
}