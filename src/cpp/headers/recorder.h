
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

    DWORD startTime = 0;
    HHOOK hook      = NULL;
    std::vector<KeyEvent> recordedKeyEvents;
};