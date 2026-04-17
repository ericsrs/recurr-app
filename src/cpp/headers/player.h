// player.h

#pragma once

#include <windows.h>
#include <vector>
#include <string>

#include "json.hpp"
#include "keyEvent.h"

using json = nlohmann::json;

class Player
{
public:
    static Player& instance();

    void load(const std::string& macroPath);
    void play();

private:
    Player() = default;
    ~Player() = default;
    Player(const Player&) = delete;
    Player& operator=(const Player&) = delete;

    void sendKey(DWORD vkCode, bool keyDown);

    std::vector<KeyEvent> events;
};