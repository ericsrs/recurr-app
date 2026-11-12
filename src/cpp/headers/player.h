// player.h

#pragma once

#include <windows.h>
#include <vector>
#include <string>
#include <iostream>
#include <fstream>

#include "../headers/json.hpp"   /* nhlomann */
#include "../headers/keyEvent.h" /* keyEvent */

using json = nlohmann::json;


/*******************************************************
 * CLASS - Player
 * -----------------------------------------------------
 * This class
********************************************************/


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

    void releaseModifiers();
    void sendKey(DWORD vkCode, bool keyDown);

    std::vector<KeyEvent> events;
};