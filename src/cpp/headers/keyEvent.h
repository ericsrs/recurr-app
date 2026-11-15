// keyEvent.h

#pragma once
#include <windows.h>

/*******************************************************
 * STRUCT - KeyEvent
 * -----------------------------------------------------
 * This struct holds 
********************************************************/

struct KeyEvent
{
    DWORD vkCode;
    bool  keyDown;
    DWORD timestamp;

    LONG x; // x position of the mouse at a click
    LONG y; // y position of the mouse at a click

    KeyEvent() : vkCode(0), keyDown(false), timestamp(-1), x(0), y(0) {}
    KeyEvent(DWORD vkCode, bool keyDown, DWORD timestamp, LONG x = 0, LONG y = 0)
    : vkCode(vkCode), keyDown(keyDown), timestamp(timestamp), x(x), y(y) {}
};