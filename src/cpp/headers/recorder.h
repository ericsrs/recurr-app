
// recorder.h

#pragma once

#include <windows.h> /* HHOOK       */   
#include <vector>    /* std::vector */
#include <iostream>  /* std::cerr   */

#include "../headers/json.hpp"   /* nhlomann */
#include "../headers/keyEvent.h" /* keyEvent */

using json = nlohmann::json;


/*******************************************************
 * CLASS - Recorder
 * -----------------------------------------------------
 * This class
********************************************************/

class Recorder
{
public:
    static Recorder& instance();

    void start();
    void stop();
    json getEventsAsJson() const;

private:
    Recorder() = default;
    ~Recorder() = default;
    Recorder(const Recorder&) = delete;
    Recorder& operator=(const Recorder&) = delete;

    static LRESULT CALLBACK KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam);
    static LRESULT CALLBACK MouseProc(int nCode, WPARAM wParam, LPARAM lParam);

    void push(DWORD vk, bool down, DWORD time, LONG x = 0, LONG y = 0);

    int buttonsHeld = 0; // # of mouse buttons held simultaneously

    DWORD startTime = 0;
    DWORD lastMoveTime = 0;

    HHOOK keyHook   = NULL;
    HHOOK mouseHook = NULL;
    std::vector<KeyEvent> recordedKeyEvents;
};