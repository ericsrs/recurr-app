// player.cpp

#include "Player.h"
#include <iostream>
#include <fstream>


Player& Player::instance()
{
    static Player player;
    return player;
}


void Player::load(const std::string& macroPath)
{
    events.clear();

    std::cerr << "Opening file: " << macroPath << "\n";
    std::ifstream file(macroPath);

    if (!file.is_open())
    {
        std::cerr << "Failed to open file: " << macroPath << "\n";
        return;
    }

    json j;
    file >> j;

    for (const auto& e : j)
    {
        events.push_back(KeyEvent(
            e["vkCode"],
            e["keyDown"],
            e["timestamp"]
        ));
    }

    std::cerr << "Loaded " << events.size() << " events\n";
}


void Player::play()
{
    if (events.empty())
    {
        std::cerr << "No events loaded\n";
        return;
    }

    std::cerr << "Playing " << events.size() << " events\n";

    Sleep(3000);

    for (size_t i = 0; i < events.size(); ++i)
    {
        // Gap between this event and the previous one
        // if (i > 0)
        // {
        //     int gap = events[i].timestamp - events[i - 1].timestamp;
        //     if (gap > 0) Sleep(gap);
        // }

        sendKey(events[i].vkCode, events[i].keyDown);
        Sleep(500);
    }

    std::cerr << "Playback complete\n";
}


void Player::sendKey(DWORD vkCode, bool keyDown)
{
    INPUT input = {};
    input.type       = INPUT_KEYBOARD;
    input.ki.wVk     = vkCode;
    input.ki.dwFlags = keyDown ? 0 : KEYEVENTF_KEYUP;

    SendInput(1, &input, sizeof(INPUT));
}