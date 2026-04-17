// keyEvent.h

#pragma once
#include <windows.h>

/*******************************************************
 * STRUCT - KeyEvent
 * -----------------------------------------------------
 * This struct
********************************************************/

struct KeyEvent
{
    DWORD vkCode;
    bool  keyDown;
    int   timestamp;

    KeyEvent() : vkCode(DWORD()), keyDown(false), timestamp(-1) {}
    KeyEvent(DWORD vkCode, bool keyDown, int timestamp)
    : vkCode(vkCode), keyDown(keyDown), timestamp(timestamp) {}
};